import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useApp, type DeviceConfig } from '@/context/AppContext';
import useColors from '@/hooks/useColors';
import { AppHeader } from '@/components/AppHeader';

function ReadRow({ label, value, icon, colors }: any) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 12 }}>
      <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: `${colors.accent}15`, alignItems: 'center', justifyContent: 'center' }}>
        <Feather name={icon} size={14} color={colors.accent} />
      </View>
      <Text style={{ flex: 1, fontSize: 13, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }}>{label}</Text>
      <Text style={{ fontSize: 13, color: colors.foreground, fontFamily: 'Inter_600SemiBold' }}>{value}</Text>
    </View>
  );
}

function FieldRow({ label, value, onChange, error, modified, editable, colors }: any) {
  return (
    <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }}>{label}</Text>
        {modified && <View style={{ backgroundColor: `${colors.accent}18`, borderRadius: 100, paddingHorizontal: 6, paddingVertical: 2 }}><Text style={{ fontSize: 9, color: colors.accent, fontFamily: 'Inter_700Bold' }}>MODIFIED</Text></View>}
      </View>
      <TextInput
        style={[{ height: 40, borderRadius: 8, borderWidth: 1, borderColor: modified ? colors.accent : colors.border, paddingHorizontal: 12, fontSize: 14, color: colors.foreground, fontFamily: 'Inter_400Regular', backgroundColor: colors.background }, !editable && { opacity: 0.5 }]}
        value={String(value)}
        onChangeText={onChange}
        editable={editable}
        keyboardType="numeric"
        placeholderTextColor={colors.mutedForeground}
      />
      {error ? <Text style={{ fontSize: 11, color: colors.destructive, marginTop: 4, fontFamily: 'Inter_400Regular' }}>{error}</Text> : null}
    </View>
  );
}

function CountdownPill({ until, colors }: { until: number | null; colors: any }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  if (!until) return null;
  const secs = Math.max(0, Math.floor((until - now) / 1000));
  const mins = Math.floor(secs / 60);
  const rs = secs % 60;
  const color = secs > 60 ? colors.success : secs > 20 ? colors.warning : colors.destructive;
  return (
    <View style={{ backgroundColor: `${color}18`, borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 }}>
      <Text style={{ fontSize: 12, color, fontFamily: 'Inter_600SemiBold' }}>{mins}:{String(rs).padStart(2, '0')} remaining</Text>
    </View>
  );
}

export default function DeviceScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { mode } = useLocalSearchParams<{ mode: string }>();
  const { devices, connect, disconnect, simulateReset, writeConfig, addLog, user } = useApp();
  const insets = useSafeAreaInsets();
  const headerH = insets.top + (Platform.OS === 'web' ? 67 + 56 : 56);

  const isSet = mode === 'set';
  const device = devices.find((d) => d.id === id);

  const [form, setForm] = useState({
    dataScheduleFrequency: device?.config.dataScheduleFrequency ?? 15,
    alertFrequencyCount: device?.config.alertFrequencyCount ?? 3,
    alertFrequencyInterval: device?.config.alertFrequencyInterval ?? 60,
    ioa: device?.config.ioa ?? 1024,
    bleNetwork: device?.config.bleNetwork ?? 4,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const originalForm = useRef({ ...form });

  const modifiedFields = Object.keys(form).filter(
    (k) => form[k as keyof typeof form] !== originalForm.current[k as keyof typeof originalForm.current]
  );

  const validate = () => {
    const errs: Record<string, string> = {};
    if (form.dataScheduleFrequency < 1 || form.dataScheduleFrequency > 1440) errs.dataScheduleFrequency = 'Min 1, Max 1440';
    if (form.alertFrequencyCount < 0 || form.alertFrequencyCount > 100) errs.alertFrequencyCount = 'Min 0, Max 100';
    if (form.alertFrequencyInterval < 10 || form.alertFrequencyInterval > 3600) errs.alertFrequencyInterval = 'Min 10, Max 3600';
    if (form.ioa < 1 || form.ioa > 65535) errs.ioa = 'Min 1, Max 65535';
    if (form.bleNetwork < 0 || form.bleNetwork > 15) errs.bleNetwork = 'Min 0, Max 15';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const res = await writeConfig(id!, form);
    setSaving(false);
    if (res.ok) {
      addLog({
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        deviceId: id!,
        deviceName: device?.name ?? 'Device',
        engineer: user?.name ?? 'Engineer',
        timestamp: Date.now(),
        oldValues: originalForm.current,
        newValues: form,
        synced: false,
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const setField = (field: string, val: string) => {
    setForm((prev) => ({ ...prev, [field]: Number(val) || 0 }));
  };

  if (!device) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <AppHeader title="Device" back />
        <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }}>Device not found.</Text>
      </View>
    );
  }

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { paddingTop: headerH + 12, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 60), paddingHorizontal: 16 },
    demoTag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.warningBg, borderRadius: 100, paddingHorizontal: 12, paddingVertical: 5, alignSelf: 'flex-start', marginBottom: 12 },
    demoTagText: { fontSize: 11, color: colors.warning, fontFamily: 'Inter_600SemiBold' },
    statusCard: { backgroundColor: colors.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 16 },
    statusLabel: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginBottom: 4 },
    statusTitle: { fontSize: 18, fontWeight: '700' as const, color: colors.foreground, fontFamily: 'Inter_700Bold' },
    sectionCard: { backgroundColor: colors.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 16 },
    sectionTitle: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 1.5, color: colors.mutedForeground, fontFamily: 'Inter_700Bold', textTransform: 'uppercase' as const, marginBottom: 4 },
    modifiedBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: `${colors.accent}12`, borderRadius: 10, padding: 12, marginBottom: 16, gap: 8, borderWidth: 1, borderColor: `${colors.accent}30` },
    modifiedText: { fontSize: 13, color: colors.accent, fontFamily: 'Inter_600SemiBold' },
    saveBtn: { height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, marginBottom: 12 },
    saveBtnText: { fontSize: 15, fontWeight: '600' as const, color: '#FFFFFF', fontFamily: 'Inter_600SemiBold' },
    disconnectBtn: { alignItems: 'center', paddingVertical: 12 },
    disconnectText: { fontSize: 14, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
  });

  const errorStatus = device.config.errorStatus;
  const isError = errorStatus !== 'OK';

  return (
    <View style={s.container}>
      <AppHeader title={device.name} back />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.demoTag}>
          <Feather name="info" size={12} color={colors.warning} />
          <Text style={s.demoTagText}>Demo Mode</Text>
        </View>

        <View style={s.statusCard}>
          <Text style={s.statusLabel}>{isSet ? 'Configure' : 'Reading Data'}</Text>
          <Text style={s.statusTitle}>{device.name}</Text>
          <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 4 }}>
            {id} · {device.mac}
          </Text>
          {isSet && device.discoverableUntil && (
            <View style={{ marginTop: 10 }}>
              <CountdownPill until={device.discoverableUntil} colors={colors} />
            </View>
          )}
          {isSet && (
            <Pressable
              style={({ pressed }) => [{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.muted, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, alignSelf: 'flex-start', opacity: pressed ? 0.7 : 1 }]}
              onPress={() => simulateReset(id!)}
            >
              <Feather name="refresh-cw" size={13} color={colors.foreground} />
              <Text style={{ fontSize: 12, color: colors.foreground, fontFamily: 'Inter_500Medium' }}>Simulate Reset</Text>
            </Pressable>
          )}
        </View>

        {/* Read-only Telemetry */}
        <View style={s.sectionCard}>
          <Text style={s.sectionTitle}>Device Telemetry (Read-only)</Text>
          <ReadRow label="Device Type" value={device.config.deviceType} icon="cpu" colors={colors} />
          <ReadRow label="Firmware" value={device.config.firmwareVersion} icon="package" colors={colors} />
          <ReadRow label="Battery (V)" value={`${device.config.batteryVoltage} V`} icon="battery" colors={colors} />
          <ReadRow label="Core Temp (°C)" value={`${device.config.coreTemp}°C`} icon="thermometer" colors={colors} />
          <ReadRow label="RSSI (dBm)" value={`${Math.round(device.rssi)} dBm`} icon="wifi" colors={colors} />
          <ReadRow label="Error Status" value={errorStatus} icon={isError ? 'alert-circle' : 'check-circle'} colors={{ ...colors, accent: isError ? colors.destructive : colors.success }} />
          <ReadRow label="BLE Network" value={device.config.bleNetwork} icon="share-2" colors={colors} />
          <ReadRow label="Analog Values" value={device.config.analogValues.join(' / ')} icon="bar-chart-2" colors={colors} />
        </View>

        {/* Configuration */}
        <View style={s.sectionCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={s.sectionTitle}>Configuration</Text>
            <Text style={{ fontSize: 12, color: isSet ? colors.success : colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }}>
              {isSet ? 'Editable' : 'Read-only'}
            </Text>
          </View>
          <FieldRow label="Data Schedule Frequency (min)" value={form.dataScheduleFrequency} onChange={(v: string) => setField('dataScheduleFrequency', v)} error={errors.dataScheduleFrequency} modified={modifiedFields.includes('dataScheduleFrequency')} editable={isSet} colors={colors} />
          <FieldRow label="Alert Frequency Count" value={form.alertFrequencyCount} onChange={(v: string) => setField('alertFrequencyCount', v)} error={errors.alertFrequencyCount} modified={modifiedFields.includes('alertFrequencyCount')} editable={isSet} colors={colors} />
          <FieldRow label="Alert Frequency Interval (sec)" value={form.alertFrequencyInterval} onChange={(v: string) => setField('alertFrequencyInterval', v)} error={errors.alertFrequencyInterval} modified={modifiedFields.includes('alertFrequencyInterval')} editable={isSet} colors={colors} />
          <FieldRow label="IOA" value={form.ioa} onChange={(v: string) => setField('ioa', v)} error={errors.ioa} modified={modifiedFields.includes('ioa')} editable={isSet} colors={colors} />
          <FieldRow label="BLE Network" value={form.bleNetwork} onChange={(v: string) => setField('bleNetwork', v)} error={errors.bleNetwork} modified={modifiedFields.includes('bleNetwork')} editable={isSet} colors={colors} />
        </View>

        {modifiedFields.length > 0 && (
          <View style={s.modifiedBanner}>
            <Feather name="alert-circle" size={16} color={colors.accent} />
            <Text style={s.modifiedText}>{modifiedFields.length} Parameter(s) Modified · Unsaved changes</Text>
          </View>
        )}

        {isSet ? (
          <Pressable
            style={({ pressed }) => [s.saveBtn, { opacity: (pressed || saving) ? 0.8 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={s.saveBtnText}>Configure Device</Text>}
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [s.saveBtn, { opacity: pressed ? 0.8 : 1, backgroundColor: colors.muted }]}
            onPress={() => router.back()}
          >
            <Text style={[s.saveBtnText, { color: colors.foreground }]}>Close</Text>
          </Pressable>
        )}

        <Pressable style={s.disconnectBtn} onPress={() => { disconnect(); router.back(); }}>
          <Text style={s.disconnectText}>Disconnect & back</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
