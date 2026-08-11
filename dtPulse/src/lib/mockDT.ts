export const DT_KPIS = { total: 1250, live: 1050, inactive: 165, outage: 35 };

export const SENSOR_KPIS = { active: 3730, inactive: 242, criticalAlarms: 12, availability: '98.5%' };

export const HIERARCHY = {
  circles: ['Kanpur', 'Lucknow', 'Varanasi'],
  divisions: {
    Kanpur: ['Kanpur North', 'Kanpur South', 'Kanpur Central'],
    Lucknow: ['Lucknow East', 'Lucknow West'],
    Varanasi: ['Varanasi Urban', 'Varanasi Rural'],
  } as Record<string, string[]>,
  subDivisions: {
    'Kanpur North': ['Kalyanpur', 'Vikas Nagar', 'Govind Nagar'],
    'Kanpur South': ['Armapur', 'Rawatpur', 'Shyam Nagar'],
    'Kanpur Central': ['Civil Lines', 'Mall Road', 'Kidwai Nagar'],
    'Lucknow East': ['Hazratganj', 'Gomti Nagar'],
    'Lucknow West': ['Aliganj', 'Indira Nagar'],
    'Varanasi Urban': ['Sigra', 'Lanka'],
    'Varanasi Rural': ['Sarnath', 'Ramnagar'],
  } as Record<string, string[]>,
};

export const DT_RATING_DATA = [
  { label: '25 kVA', live: 120, outage: 8, unavailable: 12 },
  { label: '63 kVA', live: 160, outage: 10, unavailable: 15 },
  { label: '100 kVA', live: 300, outage: 5, unavailable: 20 },
  { label: '160 kVA', live: 280, outage: 8, unavailable: 22 },
  { label: '250 kVA', live: 190, outage: 4, unavailable: 16 },
];

export const SENSOR_TYPE_DATA = [
  { label: 'Oil Level', active: 1250, inactive: 80 },
  { label: 'Oil Temp', active: 1240, inactive: 90 },
  { label: 'Lug Temp', active: 1240, inactive: 72 },
];

export const ACTIVE_ALERT_SUMMARY = [
  { type: 'High Lug Temp', count: 23, color: '#DC2626' },
  { type: 'Low Oil Level', count: 18, color: '#D97706' },
  { type: 'Critical Oil Level', count: 7, color: '#DC2626' },
  { type: 'High Oil Temp', count: 15, color: '#D97706' },
  { type: 'Gateway Outage', count: 11, color: '#6B82A0' },
];

export interface ActiveAlert {
  id: string;
  dt: string;
  circle: string;
  division: string;
  subDivision: string;
  type: string;
  description: string;
  alarmValue: string;
  currentValue: string;
  alarmTs: string;
  currentTs: string;
  severity: 'critical' | 'warning';
}

export const ACTIVE_ALERTS: ActiveAlert[] = [
  { id: 'A1', dt: 'DT-3421', circle: 'Kanpur', division: 'Kanpur North', subDivision: 'Kalyanpur', type: 'High Lug Temp', description: 'Lug R temperature exceeded critical threshold', alarmValue: '80°C', currentValue: '82°C', alarmTs: '29-Apr-2026 20:23:53', currentTs: '10-May-2026 09:00:00', severity: 'critical' },
  { id: 'A2', dt: 'DT-2891', circle: 'Kanpur', division: 'Kanpur North', subDivision: 'Vikas Nagar', type: 'Low Oil Level', description: 'Oil level below minimum threshold', alarmValue: '30%', currentValue: '22%', alarmTs: '25-Apr-2026 14:10:00', currentTs: '10-May-2026 09:10:00', severity: 'warning' },
  { id: 'A3', dt: 'DT-1892', circle: 'Kanpur', division: 'Kanpur North', subDivision: 'Govind Nagar', type: 'Gateway Outage', description: 'Gateway communication lost', alarmValue: 'Online', currentValue: 'Offline', alarmTs: '10-May-2026 06:30:00', currentTs: '10-May-2026 09:15:00', severity: 'critical' },
  { id: 'A4', dt: 'DT-5102', circle: 'Kanpur', division: 'Kanpur South', subDivision: 'Armapur', type: 'High Oil Temp', description: 'Oil temperature above safe limit', alarmValue: '70°C', currentValue: '74°C', alarmTs: '08-May-2026 11:00:00', currentTs: '10-May-2026 08:45:00', severity: 'warning' },
  { id: 'A5', dt: 'DT-4231', circle: 'Lucknow', division: 'Lucknow East', subDivision: 'Hazratganj', type: 'Critical Oil Level', description: 'Oil level critically low — immediate refill required', alarmValue: '15%', currentValue: '8%', alarmTs: '09-May-2026 18:00:00', currentTs: '10-May-2026 09:20:00', severity: 'critical' },
];

export interface DTListItem {
  code: string;
  status: 'Normal' | 'Attention' | 'Outage';
  circle: string;
  division: string;
  subDivision: string;
  substation: string;
  kva: string;
  dtType: string;
  lugR: string; lugY: string; lugB: string; lugN: string;
  lugRAlert: boolean;
  oilTemp: string; oilTempTs: string;
  oilLevel: string; oilLevelTs: string;
  lugAlert: string; lugAlertTs: string;
  oilTempAlert: string; oilTempAlertTs: string;
  oilLevelAlert: string; oilLevelAlertTs: string;
  outage: string; outageTs: string;
  updatedMinsAgo: number;
  gateway: string;
  gatewayOnline: boolean;
  lat: string; lng: string;
}

export const DT_LIST: DTListItem[] = [
  {
    code: 'DT-3421', status: 'Attention', circle: 'Kanpur', division: 'Kanpur North', subDivision: 'Kalyanpur',
    substation: 'SS-101 Alpha', kva: '250 kVA', dtType: 'Distribution',
    lugR: '78°C', lugY: '68°C', lugB: '74°C', lugN: '52°C', lugRAlert: true,
    oilTemp: '61°C', oilTempTs: '10-May-2026 09:00:00', oilLevel: 'Low', oilLevelTs: '10-May-2026 09:08:00',
    lugAlert: '82°C', lugAlertTs: '29-Apr-2026 20:23:53',
    oilTempAlert: '—', oilTempAlertTs: '—',
    oilLevelAlert: 'Low', oilLevelAlertTs: '17-Apr-2026 14:47:18',
    outage: 'Normal', outageTs: '10-May-2026 09:45:00',
    updatedMinsAgo: 2, gateway: 'GW-11245', gatewayOnline: true,
    lat: '26.4499° N', lng: '80.3319° E',
  },
  {
    code: 'DT-2156', status: 'Normal', circle: 'Kanpur', division: 'Kanpur North', subDivision: 'Vikas Nagar',
    substation: 'SS-104 Beta', kva: '100 kVA', dtType: 'Distribution',
    lugR: '54°C', lugY: '52°C', lugB: '56°C', lugN: '44°C', lugRAlert: false,
    oilTemp: '55°C', oilTempTs: '10-May-2026 09:10:00', oilLevel: 'Normal', oilLevelTs: '10-May-2026 09:20:00',
    lugAlert: 'Normal', lugAlertTs: '—',
    oilTempAlert: 'Normal', oilTempAlertTs: '—',
    oilLevelAlert: 'Normal', oilLevelAlertTs: '—',
    outage: 'Normal', outageTs: '10-May-2026 09:44:00',
    updatedMinsAgo: 1, gateway: 'GW-11321', gatewayOnline: true,
    lat: '26.4510° N', lng: '80.3401° E',
  },
  {
    code: 'DT-1892', status: 'Outage', circle: 'Kanpur', division: 'Kanpur North', subDivision: 'Govind Nagar',
    substation: 'SS-108 Gamma', kva: '63 kVA', dtType: 'Distribution',
    lugR: '—', lugY: '—', lugB: '—', lugN: '—', lugRAlert: false,
    oilTemp: '—', oilTempTs: '—', oilLevel: '—', oilLevelTs: '—',
    lugAlert: '—', lugAlertTs: '—',
    oilTempAlert: '—', oilTempAlertTs: '—',
    oilLevelAlert: '—', oilLevelAlertTs: '—',
    outage: 'Outage', outageTs: '10-May-2026 06:30:00',
    updatedMinsAgo: 185, gateway: 'GW-11408', gatewayOnline: false,
    lat: '26.4488° N', lng: '80.3285° E',
  },
  {
    code: 'DT-4521', status: 'Normal', circle: 'Kanpur', division: 'Kanpur South', subDivision: 'Armapur',
    substation: 'SS-202 Delta', kva: '160 kVA', dtType: 'Distribution',
    lugR: '61°C', lugY: '59°C', lugB: '62°C', lugN: '48°C', lugRAlert: false,
    oilTemp: '58°C', oilTempTs: '10-May-2026 09:05:00', oilLevel: 'Normal', oilLevelTs: '10-May-2026 09:12:00',
    lugAlert: 'Normal', lugAlertTs: '—',
    oilTempAlert: 'Normal', oilTempAlertTs: '—',
    oilLevelAlert: 'Normal', oilLevelAlertTs: '—',
    outage: 'Normal', outageTs: '10-May-2026 09:40:00',
    updatedMinsAgo: 3, gateway: 'GW-22105', gatewayOnline: true,
    lat: '26.4401° N', lng: '80.3199° E',
  },
  {
    code: 'DT-5102', status: 'Attention', circle: 'Kanpur', division: 'Kanpur South', subDivision: 'Armapur',
    substation: 'SS-210 Epsilon', kva: '25 kVA', dtType: 'Distribution',
    lugR: '65°C', lugY: '63°C', lugB: '67°C', lugN: '51°C', lugRAlert: false,
    oilTemp: '74°C', oilTempTs: '10-May-2026 08:45:00', oilLevel: 'Normal', oilLevelTs: '10-May-2026 08:55:00',
    lugAlert: 'Normal', lugAlertTs: '—',
    oilTempAlert: '74°C', oilTempAlertTs: '08-May-2026 11:00:00',
    oilLevelAlert: 'Normal', oilLevelAlertTs: '—',
    outage: 'Normal', outageTs: '10-May-2026 08:40:00',
    updatedMinsAgo: 10, gateway: 'GW-22188', gatewayOnline: true,
    lat: '26.4388° N', lng: '80.3211° E',
  },
  {
    code: 'DT-6780', status: 'Normal', circle: 'Kanpur', division: 'Kanpur Central', subDivision: 'Civil Lines',
    substation: 'SS-301 Zeta', kva: '250 kVA', dtType: 'Distribution',
    lugR: '48°C', lugY: '46°C', lugB: '49°C', lugN: '38°C', lugRAlert: false,
    oilTemp: '50°C', oilTempTs: '10-May-2026 09:00:00', oilLevel: 'Normal', oilLevelTs: '10-May-2026 09:05:00',
    lugAlert: 'Normal', lugAlertTs: '—',
    oilTempAlert: 'Normal', oilTempAlertTs: '—',
    oilLevelAlert: 'Normal', oilLevelAlertTs: '—',
    outage: 'Normal', outageTs: '10-May-2026 09:50:00',
    updatedMinsAgo: 0, gateway: 'GW-33012', gatewayOnline: true,
    lat: '26.4600° N', lng: '80.3450° E',
  },
];

export interface DtAlarm {
  id: string;
  dtCode: string;
  subDivision: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
  active: boolean;
  assignedToMe: boolean;
}

export const DT_ALARMS: DtAlarm[] = [
  { id: 'AL1', dtCode: 'DT-3421', subDivision: 'Kalyanpur', type: 'critical', title: 'High Lug Temperature', description: 'Lug R: 82°C — Exceeded critical limit of 80°C', timestamp: '10-May-2026 08:23', active: true, assignedToMe: true },
  { id: 'AL2', dtCode: 'DT-1892', subDivision: 'Govind Nagar', type: 'critical', title: 'Gateway Outage', description: 'GW-11408 offline since 06:30', timestamp: '10-May-2026 06:30', active: true, assignedToMe: false },
  { id: 'AL3', dtCode: 'DT-4231', subDivision: 'Hazratganj', type: 'critical', title: 'Critical Oil Level', description: 'Oil level at 8% — Immediate refill required', timestamp: '09-May-2026 18:00', active: true, assignedToMe: false },
  { id: 'AL4', dtCode: 'DT-5102', subDivision: 'Armapur', type: 'warning', title: 'High Oil Temperature', description: 'Oil Temp: 74°C — Above safe operating threshold', timestamp: '10-May-2026 07:45', active: true, assignedToMe: true },
  { id: 'AL5', dtCode: 'DT-2891', subDivision: 'Vikas Nagar', type: 'warning', title: 'Low Oil Level', description: 'Oil level at 22% — Refill recommended', timestamp: '10-May-2026 06:10', active: true, assignedToMe: false },
  { id: 'AL6', dtCode: 'DT-6120', subDivision: 'Mall Road', type: 'warning', title: 'High Lug Temperature', description: 'Lug B: 75°C — Approaching critical limit', timestamp: '10-May-2026 09:00', active: true, assignedToMe: true },
  { id: 'AL7', dtCode: 'DT-3100', subDivision: 'Civil Lines', type: 'critical', title: 'Sensor Data Unavailable', description: 'Lug temperature sensor not responding', timestamp: '10-May-2026 09:05', active: true, assignedToMe: false },
];

// ─── Alerts History ──────────────────────────────────────────────────────────

export type AlertHistorySensor = 'LUG Temperature' | 'Oil Temperature' | 'Oil Level';
export type AlertHistorySeverity = 'Critical' | 'Warning';
export type AlertHistoryStatus = 'Active' | 'Resolved' | 'Acknowledged';

export interface AlertHistory {
  id: string;
  date: string;
  time: string;
  sensor: AlertHistorySensor;
  alertType: string;
  severity: AlertHistorySeverity;
  status: AlertHistoryStatus;
}

// Alert history per DT — newest first. Only LUG Temp, Oil Temp, Oil Level sensors.
export const DT_ALERT_HISTORY: Record<string, AlertHistory[]> = {
  'DT-3421': [
    { id: 'H1', date: '10-May-2026', time: '09:00:00', sensor: 'LUG Temperature', alertType: 'High Lug Temp', severity: 'Critical', status: 'Active' },
    { id: 'H2', date: '10-May-2026', time: '06:45:00', sensor: 'Oil Level', alertType: 'Low Oil Level', severity: 'Warning', status: 'Active' },
    { id: 'H3', date: '09-May-2026', time: '22:10:00', sensor: 'LUG Temperature', alertType: 'High Lug Temp', severity: 'Critical', status: 'Acknowledged' },
    { id: 'H4', date: '09-May-2026', time: '14:30:00', sensor: 'Oil Temperature', alertType: 'High Oil Temp', severity: 'Warning', status: 'Resolved' },
    { id: 'H5', date: '08-May-2026', time: '18:55:00', sensor: 'Oil Level', alertType: 'Low Oil Level', severity: 'Warning', status: 'Resolved' },
    { id: 'H6', date: '07-May-2026', time: '11:20:00', sensor: 'LUG Temperature', alertType: 'High Lug Temp', severity: 'Critical', status: 'Resolved' },
    { id: 'H7', date: '06-May-2026', time: '08:40:00', sensor: 'Oil Temperature', alertType: 'High Oil Temp', severity: 'Warning', status: 'Resolved' },
    { id: 'H8', date: '05-May-2026', time: '23:00:00', sensor: 'LUG Temperature', alertType: 'High Lug Temp', severity: 'Warning', status: 'Resolved' },
    { id: 'H9', date: '04-May-2026', time: '15:15:00', sensor: 'Oil Level', alertType: 'Low Oil Level', severity: 'Warning', status: 'Resolved' },
    { id: 'H10', date: '03-May-2026', time: '07:00:00', sensor: 'LUG Temperature', alertType: 'High Lug Temp', severity: 'Critical', status: 'Resolved' },
  ],
  'DT-5102': [
    { id: 'H11', date: '10-May-2026', time: '08:45:00', sensor: 'Oil Temperature', alertType: 'High Oil Temp', severity: 'Warning', status: 'Active' },
    { id: 'H12', date: '09-May-2026', time: '20:30:00', sensor: 'Oil Temperature', alertType: 'High Oil Temp', severity: 'Warning', status: 'Acknowledged' },
    { id: 'H13', date: '08-May-2026', time: '11:00:00', sensor: 'Oil Temperature', alertType: 'High Oil Temp', severity: 'Warning', status: 'Resolved' },
    { id: 'H14', date: '07-May-2026', time: '09:25:00', sensor: 'LUG Temperature', alertType: 'High Lug Temp', severity: 'Warning', status: 'Resolved' },
    { id: 'H15', date: '06-May-2026', time: '16:50:00', sensor: 'Oil Level', alertType: 'Low Oil Level', severity: 'Warning', status: 'Resolved' },
  ],
  'DT-2156': [
    { id: 'H16', date: '02-May-2026', time: '10:10:00', sensor: 'Oil Level', alertType: 'Low Oil Level', severity: 'Warning', status: 'Resolved' },
    { id: 'H17', date: '28-Apr-2026', time: '03:20:00', sensor: 'LUG Temperature', alertType: 'High Lug Temp', severity: 'Warning', status: 'Resolved' },
  ],
  'DT-4521': [],
  'DT-1892': [],
  'DT-6780': [],
};

// ─── Chart & table data ──────────────────────────────────────────────────────

function genSine(base: number, amplitude: number, offset: number = 0): { time: string; value: number }[] {
  return Array.from({ length: 24 }, (_, i) => ({
    time: `${String(i).padStart(2, '0')}:00`,
    value: Math.round((base + amplitude * Math.sin((i + offset) * Math.PI / 12)) * 10) / 10,
  }));
}

export const LUG_CHART_DATA = {
  R: genSine(72, 8, 0),
  Y: genSine(66, 6, 2),
  B: genSine(70, 7, 4),
};

export const OIL_TEMP_CHART_DATA = genSine(58, 10, 1);

export const OIL_LEVEL_CHART_DATA = Array.from({ length: 24 }, (_, i) => ({
  time: `${String(i).padStart(2, '0')}:00`,
  value: Math.max(0, Math.min(100, 68 - i * 0.5 + (Math.random() * 4 - 2))),
}));

export const DT_DETAILS: Record<string, Record<string, string>> = {
  'DT-3421': {
    'DT Code': 'DT-3421',
    'Circle': 'Kanpur',
    'Division': 'Kanpur North',
    'Sub-Division': 'Kalyanpur',
    'Substation': 'SS-101 Alpha',
    'Substation ID': 'KPR-SS-101',
    'Feeder': 'F-14 Kalyanpur Industrial',
    'Rating': '250 kVA',
    'DT Type': 'Distribution',
    'Installed Type': 'Pole Mounted',
    'Manufacturer': 'Bharat Bijlee Ltd.',
    'Number of Customers': '148',
    'Gateway': 'GW-11245',
    'Gateway Serial Number': 'GW-11245-SN-001',
    'Sensor Serial Numbers': 'SN-LR-3421, SN-LY-3421, SN-LB-3421, SN-LN-3421, SN-OL-3421, SN-OT-3421',
    'Installation Date': '14 Mar 2023',
    'Address': 'Near Industrial Area Gate 3, Kalyanpur, Kanpur',
    'Latitude': '26.4499° N',
    'Longitude': '80.3319° E',
    'Landmark': 'Opp. Kalyanpur IFFCO Gate',
    'Status': 'Attention',
    'Remarks': 'Lug R monitoring closely — scheduled for servicing Jun 2026',
  },
};

export const LUG_TABLE = Array.from({ length: 12 }, (_, i) => ({
  deviceId: `SN-LR-342${i}`,
  sensorType: 'Lug R Temperature',
  serverTime: `10-May-2026 0${i % 10 > 5 ? i % 10 : '0' + (i % 10)}:${(i * 5) % 60}`,
  firmware: '1.6.3',
  bleNetworkId: 4,
  analog: (70 + Math.round(Math.random() * 15)).toString(),
  battery: (12.1 + Math.random() * 0.5).toFixed(1),
  calCoef: '1.02',
  freq: '15',
  alertCount: '3',
  alertInterval: '60',
  critLimit: '80',
  ioa: '1024',
  coreTemp: (56 + Math.round(Math.random() * 8)).toString(),
  rssi: '-' + (65 + Math.round(Math.random() * 10)).toString(),
  error: 'OK',
  pushType: 'MQTT',
}));

export const OIL_TEMP_TABLE = Array.from({ length: 12 }, (_, i) => ({
  deviceId: `SN-OT-342${i}`,
  sensorType: 'Oil Temperature',
  serverTime: `10-May-2026 0${i % 10 > 5 ? i % 10 : '0' + (i % 10)}:${(i * 5) % 60}`,
  firmware: '2.0.4',
  bleNetworkId: 4,
  analog: (58 + Math.round(Math.random() * 12)).toString(),
  battery: (12.0 + Math.random() * 0.5).toFixed(1),
  calCoef: '1.00',
  freq: '15',
  alertCount: '3',
  alertInterval: '60',
  critLimit: '75',
  ioa: '1024',
  coreTemp: (62 + Math.round(Math.random() * 8)).toString(),
  rssi: '-' + (70 + Math.round(Math.random() * 10)).toString(),
  error: 'OK',
  pushType: 'MQTT',
}));

export const OIL_LEVEL_TABLE = Array.from({ length: 12 }, (_, i) => ({
  deviceId: `SN-OL-342${i}`,
  sensorType: 'Oil Level',
  battery: (11.8 + Math.random() * 0.5).toFixed(1),
  digital: Math.round(68 - i * 0.5).toString() + '%',
  oilLevelStatus: i < 4 ? 'Normal' : 'Low',
  rssi: '-' + (72 + Math.round(Math.random() * 10)).toString(),
  firmware: '1.9.0',
  calCoef: '0.98',
  critLimit: '20',
  freq: '15',
  alertCount: '3',
  alertInterval: '60',
  ioa: '1024',
  error: 'OK',
  pushType: 'MQTT',
}));
