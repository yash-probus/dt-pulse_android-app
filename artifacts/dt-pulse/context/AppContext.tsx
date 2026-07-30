import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type DeviceStatus = 'idle' | 'connected' | 'connecting' | 'error';
export type KescoDeviceType = 'sensor_gateway' | 'inmeter_sensor_gateway' | 'lug_temp' | 'oil_temp' | 'oil_level';

export interface DeviceConfig {
  deviceType: string;
  firmwareVersion: string;
  batteryVoltage: number;
  coreTemp: number;
  errorStatus: string;
  analogValues: number[];
  dataScheduleFrequency: number;
  alertFrequencyCount: number;
  alertFrequencyInterval: number;
  ioa: number;
  bleNetwork: number;
  dataPushType: 'MQTT' | 'HTTP' | 'TCP';
}

export interface BleDevice {
  id: string;
  name: string;
  mac: string;
  rssi: number;
  status: DeviceStatus;
  deviceType: KescoDeviceType;
  discoverableUntil: number | null;
  config: DeviceConfig;
}

export interface User {
  email: string;
  name: string;
  employeeId: string;
  role?: 'Admin' | 'Engineer' | 'Viewer';
  designation?: string;
  department?: string;
  circle?: string;
  phone?: string;
  reportingTo?: string;
  joinedOn?: string;
  userId?: string;
  status?: 'Active' | 'Inactive' | 'Suspended';
  expiryDate?: string;
  lastLogin?: string;
  lastPasswordReset?: string;
  lastUpdated?: string;
}

export interface ConfigLog {
  id: string;
  deviceId: string;
  deviceName: string;
  engineer: string;
  timestamp: number;
  oldValues: Partial<DeviceConfig>;
  newValues: Partial<DeviceConfig>;
  synced: boolean;
}

const SEED_DEVICES: BleDevice[] = [
  {
    id: '1000002345', name: 'Sensor Gateway', mac: 'A4:CF:12:3D:7B:01',
    rssi: -52, status: 'idle', deviceType: 'sensor_gateway',
    discoverableUntil: Date.now() + 90000,
    config: { deviceType: 'Sensor Gateway', firmwareVersion: '3.4.1', batteryVoltage: 12.6, coreTemp: 38.4, errorStatus: 'OK', analogValues: [230.1, 229.8, 231.2], dataScheduleFrequency: 15, alertFrequencyCount: 3, alertFrequencyInterval: 60, ioa: 1024, bleNetwork: 4, dataPushType: 'MQTT' },
  },
  {
    id: '1100007821', name: 'Inmeter Sensor Gateway', mac: 'A4:CF:12:3D:7B:02',
    rssi: -67, status: 'idle', deviceType: 'inmeter_sensor_gateway',
    discoverableUntil: null,
    config: { deviceType: 'Inmeter Sensor Gateway', firmwareVersion: '2.1.7', batteryVoltage: 11.9, coreTemp: 42.1, errorStatus: 'OK', analogValues: [228.5, 229.1], dataScheduleFrequency: 15, alertFrequencyCount: 3, alertFrequencyInterval: 60, ioa: 1024, bleNetwork: 4, dataPushType: 'MQTT' },
  },
  {
    id: '1200004321', name: 'Lug Temperature', mac: 'A4:CF:12:3D:7B:03',
    rssi: -71, status: 'idle', deviceType: 'lug_temp',
    discoverableUntil: Date.now() + 110000,
    config: { deviceType: 'Lug Temperature', firmwareVersion: '1.6.3', batteryVoltage: 12.3, coreTemp: 58.7, errorStatus: 'OK', analogValues: [72.4, 68.1, 74.2], dataScheduleFrequency: 15, alertFrequencyCount: 3, alertFrequencyInterval: 60, ioa: 1024, bleNetwork: 4, dataPushType: 'MQTT' },
  },
  {
    id: '2000008765', name: 'Oil Temperature', mac: 'A4:CF:12:3D:7B:04',
    rssi: -78, status: 'idle', deviceType: 'oil_temp',
    discoverableUntil: null,
    config: { deviceType: 'Oil Temperature', firmwareVersion: '2.0.4', batteryVoltage: 12.1, coreTemp: 65.2, errorStatus: 'OK', analogValues: [61.3], dataScheduleFrequency: 15, alertFrequencyCount: 3, alertFrequencyInterval: 60, ioa: 1024, bleNetwork: 4, dataPushType: 'MQTT' },
  },
  {
    id: '2100009087', name: 'Oil Level', mac: 'A4:CF:12:3D:7B:05',
    rssi: -84, status: 'idle', deviceType: 'oil_level',
    discoverableUntil: null,
    config: { deviceType: 'Oil Level', firmwareVersion: '1.9.0', batteryVoltage: 11.0, coreTemp: 35.2, errorStatus: 'LOW_BATT', analogValues: [68.0], dataScheduleFrequency: 15, alertFrequencyCount: 3, alertFrequencyInterval: 60, ioa: 1024, bleNetwork: 4, dataPushType: 'MQTT' },
  },
  {
    id: '1000034512', name: 'Sensor Gateway', mac: 'A4:CF:12:3D:7B:06',
    rssi: -61, status: 'idle', deviceType: 'sensor_gateway',
    discoverableUntil: null,
    config: { deviceType: 'Sensor Gateway', firmwareVersion: '3.4.1', batteryVoltage: 12.8, coreTemp: 36.1, errorStatus: 'OK', analogValues: [230.5, 231.0, 229.7], dataScheduleFrequency: 15, alertFrequencyCount: 3, alertFrequencyInterval: 60, ioa: 1024, bleNetwork: 4, dataPushType: 'MQTT' },
  },
];

function jitterRssi(rssi: number): number {
  return Math.max(-99, Math.min(-30, rssi + (Math.random() * 8 - 4)));
}

function stamp(): string {
  return new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function buildUser(email: string): User {
  const empId = 'EMP' + Math.floor(10000 + Math.random() * 90000);
  const userId = 'USR' + Math.floor(100000 + Math.random() * 900000);
  const name = email.startsWith('google') ? 'Google User' : 'Field Engineer';
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  return {
    email, name, employeeId: empId, role: 'Engineer',
    designation: 'Field Engineer', department: 'Distribution Operations',
    circle: 'Kanpur Urban Circle', phone: '+91 98XXXXXX12',
    reportingTo: 'S. K. Verma (Executive Engineer)',
    joinedOn: '12 Aug 2021', userId,
    status: 'Active',
    expiryDate: expiryDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    lastLogin: stamp(), lastPasswordReset: '15 Jan 2026', lastUpdated: stamp(),
  };
}

interface AppState {
  user: User | null;
  password: string;
  blePermission: boolean;
  devices: BleDevice[];
  scanning: boolean;
  connectedDeviceId: string | null;
  logs: ConfigLog[];
  lastSyncAt: number | null;
  theme: 'light' | 'dark';
}

interface AppContextValue extends AppState {
  login: (email: string) => void;
  logout: () => void;
  changePassword: (oldPw: string, newPw: string) => { ok: boolean; reason?: string };
  setBlePermission: (v: boolean) => void;
  scan: () => Promise<void>;
  connect: (id: string) => Promise<{ ok: boolean; reason?: string }>;
  disconnect: () => void;
  simulateReset: (id: string) => void;
  writeConfig: (id: string, next: Partial<DeviceConfig>) => Promise<{ ok: boolean }>;
  addLog: (log: ConfigLog) => void;
  syncLogs: () => Promise<void>;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEY = 'kesco-app';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    user: null,
    password: 'kesco123',
    blePermission: true,
    devices: SEED_DEVICES,
    scanning: false,
    connectedDeviceId: null,
    logs: [],
    lastSyncAt: null,
    theme: 'light',
  });

  // Load persisted state on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (!raw) return;
      try {
        const saved = JSON.parse(raw);
        setState((prev) => ({
          ...prev,
          user: saved.user ?? null,
          password: saved.password ?? 'kesco123',
          blePermission: saved.blePermission ?? true,
          logs: saved.logs ?? [],
          lastSyncAt: saved.lastSyncAt ?? null,
          theme: saved.theme ?? 'light',
        }));
      } catch {
        // ignore parse errors
      }
    });
  }, []);

  // Persist relevant state whenever it changes
  useEffect(() => {
    const toSave = { user: state.user, password: state.password, blePermission: state.blePermission, logs: state.logs, lastSyncAt: state.lastSyncAt, theme: state.theme };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, [state.user, state.password, state.blePermission, state.logs, state.lastSyncAt, state.theme]);

  const login = useCallback((email: string) => {
    const user = buildUser(email);
    setState((prev) => ({ ...prev, user }));
  }, []);

  const logout = useCallback(() => {
    setState((prev) => ({ ...prev, user: null, connectedDeviceId: null, devices: SEED_DEVICES, scanning: false }));
  }, []);

  const changePassword = useCallback((oldPw: string, newPw: string): { ok: boolean; reason?: string } => {
    if (oldPw !== state.password) return { ok: false, reason: 'incorrect_old_password' };
    if (newPw.length < 6) return { ok: false, reason: 'too_short' };
    setState((prev) => ({ ...prev, password: newPw }));
    return { ok: true };
  }, [state.password]);

  const setBlePermission = useCallback((v: boolean) => {
    setState((prev) => ({ ...prev, blePermission: v }));
  }, []);

  const scan = useCallback(async () => {
    setState((prev) => ({ ...prev, scanning: true }));
    await new Promise((r) => setTimeout(r, 1200));
    setState((prev) => ({
      ...prev,
      scanning: false,
      devices: prev.devices
        .map((d) => ({ ...d, rssi: jitterRssi(d.rssi) }))
        .sort((a, b) => b.rssi - a.rssi),
    }));
  }, []);

  const connect = useCallback(async (id: string): Promise<{ ok: boolean; reason?: string }> => {
    const device = state.devices.find((d) => d.id === id);
    if (!device) return { ok: false, reason: 'not_found' };
    setState((prev) => ({
      ...prev,
      devices: prev.devices.map((d) => d.id === id ? { ...d, status: 'connecting' as DeviceStatus } : d),
    }));
    await new Promise((r) => setTimeout(r, 900));
    setState((prev) => ({
      ...prev,
      connectedDeviceId: id,
      devices: prev.devices.map((d) => d.id === id ? { ...d, status: 'connected' as DeviceStatus } : { ...d, status: 'idle' as DeviceStatus }),
    }));
    return { ok: true };
  }, [state.devices]);

  const disconnect = useCallback(() => {
    setState((prev) => ({
      ...prev,
      connectedDeviceId: null,
      devices: prev.devices.map((d) => ({ ...d, status: 'idle' as DeviceStatus })),
    }));
  }, []);

  const simulateReset = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      devices: prev.devices.map((d) => d.id === id ? { ...d, discoverableUntil: Date.now() + 120000 } : d),
    }));
  }, []);

  const writeConfig = useCallback(async (id: string, next: Partial<DeviceConfig>): Promise<{ ok: boolean }> => {
    await new Promise((r) => setTimeout(r, 1100));
    if (Math.random() < 0.08) return { ok: false };
    setState((prev) => ({
      ...prev,
      devices: prev.devices.map((d) =>
        d.id === id ? { ...d, config: { ...d.config, ...next } } : d
      ),
    }));
    return { ok: true };
  }, []);

  const addLog = useCallback((log: ConfigLog) => {
    setState((prev) => ({ ...prev, logs: [log, ...prev.logs] }));
  }, []);

  const syncLogs = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 1500));
    setState((prev) => ({
      ...prev,
      logs: prev.logs.map((l) => ({ ...l, synced: true })),
      lastSyncAt: Date.now(),
    }));
  }, []);

  const toggleTheme = useCallback(() => {
    setState((prev) => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  }, []);

  const value: AppContextValue = {
    ...state,
    login, logout, changePassword, setBlePermission, scan, connect,
    disconnect, simulateReset, writeConfig, addLog, syncLogs, toggleTheme,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
