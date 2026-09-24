/**
 * ABHAYAA Permission Manager
 * Centralized, production-grade permission state service.
 * Interacts directly with real browser/device APIs without mock or assumed states.
 */

export type PermissionState =
  | 'granted'
  | 'denied'
  | 'not-granted'
  | 'requesting'
  | 'unavailable'
  | 'unknown';

export interface CameraCapabilities {
  hasFrontCamera: boolean;
  hasRearCamera: boolean;
  videoDeviceCount: number;
  simultaneousDualCameraSupported: boolean;
  deviceLabels: string[];
}

export interface PermissionDetails {
  state: PermissionState;
  lastChecked: number;
  error?: string | null;
}

export interface AllPermissionsState {
  location: PermissionDetails;
  camera: PermissionDetails;
  microphone: PermissionDetails;
  notifications: PermissionDetails;
  cameraCapabilities: CameraCapabilities;
}

type PermissionListener = (state: AllPermissionsState) => void;

class PermissionManagerService {
  private listeners: Set<PermissionListener> = new Set();

  private currentState: AllPermissionsState = {
    location: { state: 'not-granted', lastChecked: Date.now() },
    camera: { state: 'not-granted', lastChecked: Date.now() },
    microphone: { state: 'not-granted', lastChecked: Date.now() },
    notifications: { state: 'not-granted', lastChecked: Date.now() },
    cameraCapabilities: {
      hasFrontCamera: false,
      hasRearCamera: false,
      videoDeviceCount: 0,
      simultaneousDualCameraSupported: false,
      deviceLabels: [],
    },
  };

  private activePermissionStatusObjects: Map<string, PermissionStatus> = new Map();
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Initial check without requesting
    this.refreshAllPermissions();

    // Listen to tab focus & visibility change to detect revoking / granting in browser settings
    window.addEventListener('focus', () => {
      this.refreshAllPermissions();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.refreshAllPermissions();
      }
    });

    // Listen to device change (e.g. plugging in or unplugging camera/mic)
    if (navigator.mediaDevices && navigator.mediaDevices.addEventListener) {
      navigator.mediaDevices.addEventListener('devicechange', () => {
        this.inspectCameraCapabilities();
      });
    }
  }

  public subscribe(listener: PermissionListener): () => void {
    this.listeners.add(listener);
    // Immediately emit current state
    listener(this.currentState);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): AllPermissionsState {
    return { ...this.currentState };
  }

  private notify() {
    const copy = { ...this.currentState };
    this.listeners.forEach((listener) => listener(copy));
  }

  private setPermission(
    key: 'location' | 'camera' | 'microphone' | 'notifications',
    state: PermissionState,
    error?: string | null
  ) {
    this.currentState[key] = {
      state,
      lastChecked: Date.now(),
      error: error || null,
    };
    this.notify();
  }

  // ==========================================
  // 1. LOCATION PERMISSION
  // ==========================================

  public async checkLocationPermission(): Promise<PermissionState> {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      this.setPermission('location', 'unavailable', 'Geolocation API not supported on this browser.');
      return 'unavailable';
    }

    if (navigator.permissions && navigator.permissions.query) {
      try {
        const status = await navigator.permissions.query({ name: 'geolocation' });
        this.attachPermissionListener('location', status);
        const mappedState: PermissionState =
          status.state === 'granted'
            ? 'granted'
            : status.state === 'denied'
            ? 'denied'
            : 'not-granted';
        this.setPermission('location', mappedState);
        return mappedState;
      } catch (e) {
        // Fallback for browsers that do not support query({ name: 'geolocation' })
      }
    }

    // Default when browser does not expose query before request
    return this.currentState.location.state;
  }

  public async requestLocationPermission(): Promise<{ state: PermissionState; coords?: { lat: number; lng: number } }> {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      this.setPermission('location', 'unavailable', 'Geolocation API not supported.');
      return { state: 'unavailable' };
    }

    this.setPermission('location', 'requesting');

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.setPermission('location', 'granted');
          resolve({
            state: 'granted',
            coords: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          });
        },
        (error) => {
          let state: PermissionState = 'denied';
          let msg = error.message;

          if (error.code === error.PERMISSION_DENIED) {
            state = 'denied';
            msg = 'Location permission denied by user or system policy.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            state = 'unavailable';
            msg = 'GPS / Location signal unavailable on device.';
          } else if (error.code === error.TIMEOUT) {
            state = 'not-granted';
            msg = 'Location request timed out. Please try again.';
          }

          this.setPermission('location', state, msg);
          resolve({ state });
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    });
  }

  // ==========================================
  // 2. CAMERA PERMISSION & CAPABILITIES
  // ==========================================

  public async checkCameraPermission(): Promise<PermissionState> {
    if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.setPermission('camera', 'unavailable', 'Camera API not supported on this browser.');
      return 'unavailable';
    }

    if (navigator.permissions && navigator.permissions.query) {
      try {
        const status = await navigator.permissions.query({ name: 'camera' as any });
        this.attachPermissionListener('camera', status);
        const mappedState: PermissionState =
          status.state === 'granted'
            ? 'granted'
            : status.state === 'denied'
            ? 'denied'
            : 'not-granted';
        this.setPermission('camera', mappedState);
        if (mappedState === 'granted') {
          this.inspectCameraCapabilities();
        }
        return mappedState;
      } catch (e) {
        // Querying 'camera' may throw on Firefox / Safari
      }
    }

    // Try checking devices if labels are populated (indicating already granted)
    try {
      if (navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        if (videoDevices.length === 0) {
          this.setPermission('camera', 'unavailable', 'No camera hardware found.');
          return 'unavailable';
        }
        // If at least one video device has a non-empty label, permission was granted
        const hasLabels = videoDevices.some((d) => d.label && d.label.length > 0);
        if (hasLabels) {
          this.setPermission('camera', 'granted');
          this.inspectCameraCapabilities();
          return 'granted';
        }
      }
    } catch {
      // Ignore
    }

    return this.currentState.camera.state;
  }

  public async requestCameraPermission(): Promise<PermissionState> {
    if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.setPermission('camera', 'unavailable', 'Camera API not supported.');
      return 'unavailable';
    }

    this.setPermission('camera', 'requesting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
      });

      // Immediately shut off test tracks
      stream.getTracks().forEach((track) => track.stop());

      this.setPermission('camera', 'granted');
      await this.inspectCameraCapabilities();
      return 'granted';
    } catch (err: any) {
      const isDenied =
        err.name === 'NotAllowedError' ||
        err.name === 'PermissionDeniedError' ||
        err.name === 'SecurityError';
      const isUnavailable =
        err.name === 'NotFoundError' ||
        err.name === 'DevicesNotFoundError' ||
        err.name === 'NotReadableError';

      const state: PermissionState = isUnavailable ? 'unavailable' : isDenied ? 'denied' : 'not-granted';
      const msg = err.message || (isDenied ? 'Camera permission was denied.' : 'Camera hardware unavailable.');

      this.setPermission('camera', state, msg);
      return state;
    }
  }

  public async inspectCameraCapabilities(): Promise<CameraCapabilities> {
    const defaultCaps: CameraCapabilities = {
      hasFrontCamera: false,
      hasRearCamera: false,
      videoDeviceCount: 0,
      simultaneousDualCameraSupported: false,
      deviceLabels: [],
    };

    if (typeof window === 'undefined' || !navigator.mediaDevices?.enumerateDevices) {
      this.currentState.cameraCapabilities = defaultCaps;
      this.notify();
      return defaultCaps;
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === 'videoinput');

      const labels = videoDevices.map((d) => d.label || '').filter(Boolean);
      let hasFront = false;
      let hasRear = false;

      labels.forEach((lbl) => {
        const lower = lbl.toLowerCase();
        if (lower.includes('front') || lower.includes('user') || lower.includes('facing front')) {
          hasFront = true;
        }
        if (lower.includes('back') || lower.includes('rear') || lower.includes('environment') || lower.includes('facing back')) {
          hasRear = true;
        }
      });

      // If there are 2 or more cameras and neither was explicitly labeled, assume front and rear exist
      if (videoDevices.length >= 2 && !hasFront && !hasRear) {
        hasFront = true;
        hasRear = true;
      } else if (videoDevices.length === 1 && !hasFront && !hasRear) {
        hasFront = true;
      }

      const caps: CameraCapabilities = {
        hasFrontCamera: hasFront,
        hasRearCamera: hasRear,
        videoDeviceCount: videoDevices.length,
        // Standard WebRTC on consumer browsers does not reliably support simultaneous dual-camera streams
        simultaneousDualCameraSupported: false,
        deviceLabels: labels,
      };

      this.currentState.cameraCapabilities = caps;
      this.notify();
      return caps;
    } catch {
      this.currentState.cameraCapabilities = defaultCaps;
      this.notify();
      return defaultCaps;
    }
  }

  // ==========================================
  // 3. MICROPHONE PERMISSION
  // ==========================================

  public async checkMicrophonePermission(): Promise<PermissionState> {
    if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.setPermission('microphone', 'unavailable', 'Microphone API not supported on this browser.');
      return 'unavailable';
    }

    if (navigator.permissions && navigator.permissions.query) {
      try {
        const status = await navigator.permissions.query({ name: 'microphone' as any });
        this.attachPermissionListener('microphone', status);
        const mappedState: PermissionState =
          status.state === 'granted'
            ? 'granted'
            : status.state === 'denied'
            ? 'denied'
            : 'not-granted';
        this.setPermission('microphone', mappedState);
        return mappedState;
      } catch (e) {
        // Querying 'microphone' can throw on Firefox/Safari
      }
    }

    try {
      if (navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioDevices = devices.filter((d) => d.kind === 'audioinput');
        if (audioDevices.length === 0) {
          this.setPermission('microphone', 'unavailable', 'No microphone hardware found.');
          return 'unavailable';
        }
        const hasLabels = audioDevices.some((d) => d.label && d.label.length > 0);
        if (hasLabels) {
          this.setPermission('microphone', 'granted');
          return 'granted';
        }
      }
    } catch {
      // Ignore
    }

    return this.currentState.microphone.state;
  }

  public async requestMicrophonePermission(): Promise<PermissionState> {
    if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.setPermission('microphone', 'unavailable', 'Microphone API not supported.');
      return 'unavailable';
    }

    this.setPermission('microphone', 'requesting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop test tracks immediately
      stream.getTracks().forEach((track) => track.stop());

      this.setPermission('microphone', 'granted');
      return 'granted';
    } catch (err: any) {
      const isDenied =
        err.name === 'NotAllowedError' ||
        err.name === 'PermissionDeniedError' ||
        err.name === 'SecurityError';
      const isUnavailable =
        err.name === 'NotFoundError' ||
        err.name === 'DevicesNotFoundError' ||
        err.name === 'NotReadableError';

      const state: PermissionState = isUnavailable ? 'unavailable' : isDenied ? 'denied' : 'not-granted';
      const msg = err.message || (isDenied ? 'Microphone permission was denied.' : 'Microphone hardware unavailable.');

      this.setPermission('microphone', state, msg);
      return state;
    }
  }

  // ==========================================
  // 4. PUSH NOTIFICATIONS PERMISSION
  // ==========================================

  public checkNotificationPermission(): PermissionState {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      this.setPermission('notifications', 'unavailable', 'Notification API not supported in this browser.');
      return 'unavailable';
    }

    const perm = Notification.permission;
    const mappedState: PermissionState =
      perm === 'granted'
        ? 'granted'
        : perm === 'denied'
        ? 'denied'
        : 'not-granted';

    this.setPermission('notifications', mappedState);
    return mappedState;
  }

  public async requestNotificationPermission(): Promise<PermissionState> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      this.setPermission('notifications', 'unavailable', 'Notification API not supported.');
      return 'unavailable';
    }

    this.setPermission('notifications', 'requesting');

    try {
      let result: NotificationPermission;

      // Handle promise vs callback for legacy Safari/browsers
      const promise = Notification.requestPermission();
      if (promise && typeof promise.then === 'function') {
        result = await promise;
      } else {
        result = await new Promise((resolve) => {
          Notification.requestPermission((p) => resolve(p));
        });
      }

      const mappedState: PermissionState =
        result === 'granted'
          ? 'granted'
          : result === 'denied'
          ? 'denied'
          : 'not-granted';

      this.setPermission('notifications', mappedState);
      return mappedState;
    } catch (err: any) {
      this.setPermission('notifications', 'denied', err.message || 'Error requesting notification permission.');
      return 'denied';
    }
  }

  // ==========================================
  // REFRESH & LISTENER HELPERS
  // ==========================================

  public async refreshAllPermissions(): Promise<AllPermissionsState> {
    await Promise.allSettled([
      this.checkLocationPermission(),
      this.checkCameraPermission(),
      this.checkMicrophonePermission(),
      Promise.resolve(this.checkNotificationPermission()),
    ]);
    return this.getState();
  }

  private attachPermissionListener(
    key: 'location' | 'camera' | 'microphone',
    status: PermissionStatus
  ) {
    if (!status) return;
    this.activePermissionStatusObjects.set(key, status);

    status.onchange = () => {
      const mappedState: PermissionState =
        status.state === 'granted'
          ? 'granted'
          : status.state === 'denied'
          ? 'denied'
          : 'not-granted';
      this.setPermission(key, mappedState);
      if (key === 'camera' && mappedState === 'granted') {
        this.inspectCameraCapabilities();
      }
    };
  }
}

export const permissionManager = new PermissionManagerService();
