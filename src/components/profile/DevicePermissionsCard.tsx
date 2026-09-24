import React from 'react';
import {
  MapPin,
  Camera,
  Mic,
  Bell,
  CheckCircle2,
  XCircle,
  CircleDot,
  Loader2,
  MinusCircle,
  RefreshCw,
  Shield,
  HelpCircle,
  Info,
  Smartphone,
} from 'lucide-react';
import { usePermissions } from '../../context/PermissionContext';
import { PermissionState } from '../../services/permissionManager';

interface PermissionBadgeProps {
  state: PermissionState;
}

const PermissionBadge: React.FC<PermissionBadgeProps> = ({ state }) => {
  switch (state) {
    case 'granted':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Granted ✓</span>
        </span>
      );
    case 'denied':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          <span>Denied</span>
        </span>
      );
    case 'requesting':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold animate-pulse">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
          <span>Requesting…</span>
        </span>
      );
    case 'unavailable':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-stone-100 text-stone-600 border border-stone-200 text-xs font-bold">
          <MinusCircle className="w-3.5 h-3.5 text-stone-500" />
          <span>Unavailable</span>
        </span>
      );
    case 'not-granted':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-stone-100 text-stone-700 border border-stone-200 text-xs font-bold">
          <CircleDot className="w-3.5 h-3.5 text-stone-500" />
          <span>Not Granted</span>
        </span>
      );
  }
};

export const DevicePermissionsCard: React.FC = () => {
  const {
    permissions,
    requestLocation,
    requestCamera,
    requestMicrophone,
    requestNotifications,
    refreshPermissions,
  } = usePermissions();

  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshPermissions();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const { location, camera, microphone, notifications, cameraCapabilities } = permissions;

  return (
    <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Smartphone className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">
              Device Permissions & Emergency Hardware Access
            </h3>
            <p className="text-xs text-stone-500">
              ABHAYAA requires explicit permissions for emergency features. Dynamic real-time browser states.
            </p>
          </div>
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-50 hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-semibold border border-stone-200 cursor-pointer transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          <span>Refresh States</span>
        </button>
      </div>

      {/* Permissions List */}
      <div className="space-y-4 text-xs">
        {/* 1. PRECISE GPS LOCATION */}
        <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/90 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-sm font-bold text-stone-900 block">
                  Precise GPS Location
                </strong>
                <p className="text-stone-500 text-xs">
                  Used to share your location during emergencies and show nearby safety assistance.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <PermissionBadge state={location.state} />
              {location.state !== 'granted' && location.state !== 'unavailable' && (
                <button
                  onClick={() => requestLocation()}
                  disabled={location.state === 'requesting'}
                  className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs transition-colors disabled:opacity-50"
                >
                  {location.state === 'denied' ? 'Re-request Location' : 'Allow Location'}
                </button>
              )}
            </div>
          </div>

          {location.error && (
            <div className="text-[11px] text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{location.error}</span>
            </div>
          )}
          {location.state === 'denied' && !location.error && (
            <div className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                Location is denied in your browser settings. To enable, click the tune/lock icon in your browser address bar and set Location to "Allow", then click Refresh States.
              </span>
            </div>
          )}
        </div>

        {/* 2. CAMERA ACCESS & CAPABILITIES */}
        <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/90 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-sm font-bold text-stone-900 block">
                  Camera Access
                </strong>
                <p className="text-stone-500 text-xs">
                  Used to preserve emergency visual evidence when SOS is activated.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <PermissionBadge state={camera.state} />
              {camera.state !== 'granted' && camera.state !== 'unavailable' && (
                <button
                  onClick={() => requestCamera()}
                  disabled={camera.state === 'requesting'}
                  className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs transition-colors disabled:opacity-50"
                >
                  {camera.state === 'denied' ? 'Re-request Camera' : 'Allow Camera'}
                </button>
              )}
            </div>
          </div>

          {/* Real Camera Capability Distinction (Requirement 4) */}
          <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-1.5">
            <div className="text-[11px] font-bold text-stone-700 uppercase tracking-wide">
              Hardware Lens & Stream Capabilities:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-100">
                <span className="text-stone-600 font-medium">Front Camera:</span>
                <span className={`font-bold ${cameraCapabilities.hasFrontCamera ? 'text-emerald-700' : 'text-stone-500'}`}>
                  {camera.state === 'granted'
                    ? cameraCapabilities.hasFrontCamera
                      ? 'Available ✓'
                      : 'Not Detected'
                    : 'Permission Required'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-100">
                <span className="text-stone-600 font-medium">Rear Camera:</span>
                <span className={`font-bold ${cameraCapabilities.hasRearCamera ? 'text-emerald-700' : 'text-stone-500'}`}>
                  {camera.state === 'granted'
                    ? cameraCapabilities.hasRearCamera
                      ? 'Available ✓'
                      : 'Not Detected'
                    : 'Permission Required'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-100">
                <span className="text-stone-600 font-medium">Simultaneous Dual-Stream:</span>
                <span className="font-bold text-stone-600">
                  Not supported (Web limitation)
                </span>
              </div>
            </div>
            <p className="text-[10px] text-stone-400">
              Note: Modern mobile web browsers do not allow concurrent front+rear hardware encoding streams. ABHAYAA provides high-reliability lens toggle during active SOS evidence recording.
            </p>
          </div>

          {camera.error && (
            <div className="text-[11px] text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{camera.error}</span>
            </div>
          )}
          {camera.state === 'denied' && !camera.error && (
            <div className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                Camera access is blocked in your browser. Enable camera in your browser site permissions to record SOS visual evidence.
              </span>
            </div>
          )}
        </div>

        {/* 3. MICROPHONE / AUDIO */}
        <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/90 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-sm font-bold text-stone-900 block">
                  Microphone / Audio
                </strong>
                <p className="text-stone-500 text-xs">
                  Used for the Safety Word emergency feature.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <PermissionBadge state={microphone.state} />
              {microphone.state !== 'granted' && microphone.state !== 'unavailable' && (
                <button
                  onClick={() => requestMicrophone()}
                  disabled={microphone.state === 'requesting'}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs transition-colors disabled:opacity-50"
                >
                  {microphone.state === 'denied' ? 'Re-request Microphone' : 'Allow Microphone'}
                </button>
              )}
            </div>
          </div>

          {microphone.error && (
            <div className="text-[11px] text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{microphone.error}</span>
            </div>
          )}
          {microphone.state === 'denied' && !microphone.error && (
            <div className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                Microphone permission is denied. Safety Word voice detection cannot run without microphone access.
              </span>
            </div>
          )}
        </div>

        {/* 4. PUSH NOTIFICATIONS */}
        <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/90 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-sm font-bold text-stone-900 block">
                  Push Notifications
                </strong>
                <p className="text-stone-500 text-xs">
                  Used for emergency and safety alerts.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <PermissionBadge state={notifications.state} />
              {notifications.state !== 'granted' && notifications.state !== 'unavailable' && (
                <button
                  onClick={() => requestNotifications()}
                  disabled={notifications.state === 'requesting'}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs transition-colors disabled:opacity-50"
                >
                  {notifications.state === 'denied' ? 'Re-request Notifications' : 'Allow Notifications'}
                </button>
              )}
            </div>
          </div>

          {notifications.error && (
            <div className="text-[11px] text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{notifications.error}</span>
            </div>
          )}
          {notifications.state === 'denied' && !notifications.error && (
            <div className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                Notifications are blocked in your browser. Unblock notifications in your site permissions to receive critical emergency alerts.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Production Architecture & Privacy Note */}
      <div className="p-3.5 bg-stone-100 rounded-2xl border border-stone-200/80 text-[11px] text-stone-600 space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-stone-800">
          <Shield className="w-3.5 h-3.5 text-blue-700" />
          <span>Production Android / Flutter Permissions Roadmap</span>
        </div>
        <p className="leading-relaxed">
          In Android production (Kotlin/Flutter), these permissions map to native manifest and runtime checks: <code className="px-1 py-0.5 bg-white rounded border border-stone-300 font-mono text-[10px]">ACCESS_FINE_LOCATION</code>, <code className="px-1 py-0.5 bg-white rounded border border-stone-300 font-mono text-[10px]">CAMERA</code>, <code className="px-1 py-0.5 bg-white rounded border border-stone-300 font-mono text-[10px]">RECORD_AUDIO</code>, and <code className="px-1 py-0.5 bg-white rounded border border-stone-300 font-mono text-[10px]">POST_NOTIFICATIONS</code>. Hardware is never accessed secretly or without explicit permission.
        </p>
      </div>
    </div>
  );
};
