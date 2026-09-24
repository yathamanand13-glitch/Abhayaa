import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  permissionManager,
  AllPermissionsState,
  PermissionState,
} from '../services/permissionManager';

interface PermissionContextValue {
  permissions: AllPermissionsState;
  requestLocation: () => Promise<{ state: PermissionState; coords?: { lat: number; lng: number } }>;
  requestCamera: () => Promise<PermissionState>;
  requestMicrophone: () => Promise<PermissionState>;
  requestNotifications: () => Promise<PermissionState>;
  refreshPermissions: () => Promise<AllPermissionsState>;
}

const PermissionContext = createContext<PermissionContextValue | undefined>(undefined);

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [permissions, setPermissions] = useState<AllPermissionsState>(permissionManager.getState());

  useEffect(() => {
    // Subscribe to permission changes from manager
    const unsubscribe = permissionManager.subscribe((newState) => {
      setPermissions(newState);
    });

    // Refresh immediately on mount
    permissionManager.refreshAllPermissions();

    return () => {
      unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      permissions,
      requestLocation: () => permissionManager.requestLocationPermission(),
      requestCamera: () => permissionManager.requestCameraPermission(),
      requestMicrophone: () => permissionManager.requestMicrophonePermission(),
      requestNotifications: () => permissionManager.requestNotificationPermission(),
      refreshPermissions: () => permissionManager.refreshAllPermissions(),
    }),
    [permissions]
  );

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
};

export const usePermissions = (): PermissionContextValue => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};
