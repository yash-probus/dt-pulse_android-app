export type ManualCategory = 'sensor' | 'communication';

export interface ManualSection {
  heading: string;
  body: string;
}

export interface ManualProduct {
  slug: string;
  name: string;
  shortName: string;
  category: ManualCategory;
  categoryLabel: string;
  tagline: string;
  icon: string;
  accent: string;
  sections: ManualSection[];
}

const PLACEHOLDER = 'Content pending approval from KESCO engineering. Approved technical details will appear here.';

function commonSections(): ManualSection[] {
  return [
    { heading: 'Overview', body: PLACEHOLDER },
    { heading: 'Purpose', body: PLACEHOLDER },
    { heading: 'Installation Guide', body: PLACEHOLDER },
    { heading: 'Wiring / Connection', body: PLACEHOLDER },
    { heading: 'Configuration / Commissioning', body: PLACEHOLDER },
    { heading: 'Normal Operation', body: PLACEHOLDER },
    { heading: 'Troubleshooting', body: PLACEHOLDER },
    { heading: 'Communication Checks', body: PLACEHOLDER },
    { heading: 'Maintenance / Field Checks', body: PLACEHOLDER },
    { heading: 'Safety Notes', body: PLACEHOLDER },
  ];
}

export const MANUAL_PRODUCTS: ManualProduct[] = [
  { slug: 'lug-r', name: 'Lug R Temperature Sensor', shortName: 'Lug R', category: 'sensor', categoryLabel: 'Sensor', tagline: 'Phase R lug temperature monitoring for distribution transformers.', icon: 'zap', accent: '#DC2626', sections: commonSections() },
  { slug: 'lug-y', name: 'Lug Y Temperature Sensor', shortName: 'Lug Y', category: 'sensor', categoryLabel: 'Sensor', tagline: 'Phase Y lug temperature monitoring for distribution transformers.', icon: 'zap', accent: '#D97706', sections: commonSections() },
  { slug: 'lug-b', name: 'Lug B Temperature Sensor', shortName: 'Lug B', category: 'sensor', categoryLabel: 'Sensor', tagline: 'Phase B lug temperature monitoring for distribution transformers.', icon: 'zap', accent: '#0B2545', sections: commonSections() },
  { slug: 'lug-n', name: 'Lug N Temperature Sensor', shortName: 'Lug N', category: 'sensor', categoryLabel: 'Sensor', tagline: 'Neutral lug temperature monitoring for distribution transformers.', icon: 'zap', accent: '#1B7A8A', sections: commonSections() },
  { slug: 'oil-level', name: 'Oil Level Sensor', shortName: 'Oil Level', category: 'sensor', categoryLabel: 'Sensor', tagline: 'Real-time transformer oil level detection and monitoring.', icon: 'droplet', accent: '#0B2545', sections: commonSections() },
  { slug: 'oil-temperature', name: 'Oil Temperature Sensor', shortName: 'Oil Temp', category: 'sensor', categoryLabel: 'Sensor', tagline: 'Continuous oil temperature measurement for thermal protection.', icon: 'thermometer', accent: '#D97706', sections: commonSections() },
  { slug: 'ambient-temperature', name: 'Ambient Temperature Sensor', shortName: 'Ambient Temp', category: 'sensor', categoryLabel: 'Sensor', tagline: 'Environmental temperature measurement at DT installation site.', icon: 'sun', accent: '#059669', sections: commonSections() },
  { slug: 'humidity', name: 'Humidity Sensor', shortName: 'Humidity', category: 'sensor', categoryLabel: 'Sensor', tagline: 'Relative humidity monitoring for moisture-sensitive DT components.', icon: 'cloud-rain', accent: '#1B7A8A', sections: commonSections() },
  { slug: 'gateway', name: 'Sensor Gateway', shortName: 'Gateway', category: 'communication', categoryLabel: 'Communication', tagline: 'BLE-to-cloud gateway for on-DT sensors — data relay and network bridge.', icon: 'wifi', accent: '#1B7A8A', sections: commonSections() },
];

export function findManual(slug: string): ManualProduct | undefined {
  return MANUAL_PRODUCTS.find((p) => p.slug === slug);
}

export const KESCO_TYPE_RANGES: Record<string, { prefix: string; label: string; short: string }> = {
  sensor_gateway: { prefix: '10', label: 'Sensor Gateway', short: 'GW' },
  inmeter_sensor_gateway: { prefix: '11', label: 'Inmeter Sensor Gateway', short: 'IGW' },
  lug_temp: { prefix: '12', label: 'Lug Temperature', short: 'LUG' },
  oil_temp: { prefix: '20', label: 'Oil Temperature', short: 'OT' },
  oil_level: { prefix: '21', label: 'Oil Level', short: 'OL' },
};

export function getDeviceTypeInfo(deviceId: string): { prefix: string; label: string; short: string } | null {
  const prefix = deviceId.substring(0, 2);
  const entry = Object.values(KESCO_TYPE_RANGES).find((r) => r.prefix === prefix);
  return entry ?? null;
}
