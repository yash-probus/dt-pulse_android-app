import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {  Bluetooth, Eye, Pencil, Info, Wifi, Search  } from '@/utils/icons';
import { router } from '@/utils/router';
import Haptics from 'react-native-haptic-feedback';
import { useApp, type BleDevice } from '@/context/AppContext';
import useColors from '@/hooks/useColors';
import { AppHeader } from '@/components/AppHeader';
import { getDeviceTypeInfo } from '@/lib/mockManual';

function DiscoverableChip({ until, colors }: { until: number | null; colors: any }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!until) return (
    <View style={{ backgroundColor: colors.muted, borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3 }}>
      <Text style={{ fontSize: 10, color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }}>Not Discoverable</Text>
    </View>
  );
  const secs = Math.max(0, Math.floor((until - now) / 1000));
  const mins = Math.floor(secs / 60);
  const remSecs = secs % 60;
  const color = secs > 60 ? colors.success : secs > 20 ? colors.warning : colors.destructive;
  return (
    <View style={{ backgroundColor: `${color}18`, borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3 }}>
      <Text style={{ fontSize: 10, color, fontFamily: 'Inter_600SemiBold' }}>
        Discoverable · {mins}:{String(remSecs).padStart(2, '0')}
      </Text>
    </View>
  );
}

function DeviceCard({ device, highlighted, onConnect, onOpen, colors }: { device: BleDevice; highlighted: boolean; onConnect: () => void; onOpen: (mode: string) => void; colors: any }) {
  const isConnected = device.status === 'connected';
  const isConnecting = device.status === 'connecting';
  const typeInfo = getDeviceTypeInfo(device.id);

  return (
    <View style={[{ backgroundColor: colors.card, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: highlighted ? 2 : 1, borderColor: highlighted ? colors.accent : colors.border }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 }}>
        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${colors.accent}18`, alignItems: 'center', justifyContent: 'center' }}>
          <Bluetooth size={18} color={colors.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '700' as const, color: colors.foreground, fontFamily: 'Inter_700Bold' }}>{typeInfo?.label ?? device.name}</Text>
          <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }}>RSSI: {Math.round(device.rssi)} dBm</Text>
        </View>
        {isConnected ? (
          <View style={{ backgroundColor: colors.successBg, borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={{ fontSize: 10, color: colors.success, fontFamily: 'Inter_600SemiBold' }}>Connected</Text>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [{ backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, opacity: (pressed || isConnecting) ? 0.7 : 1 }]}
            onPress={onConnect}
            disabled={isConnecting}
          >
            {isConnecting ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={{ fontSize: 12, color: '#FFFFFF', fontFamily: 'Inter_600SemiBold' }}>Connect</Text>}
          </Pressable>
        )}
      </View>
      <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginBottom: 4 }}>
        Device ID: <Text style={{ fontFamily: 'Inter_600SemiBold', color: colors.foreground }}>{device.id}</Text>
      </Text>
      <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginBottom: 8 }}>
        MAC: <Text style={{ fontFamily: 'Inter_500Medium', color: colors.foreground }}>{device.mac}</Text>
      </Text>
      <DiscoverableChip until={device.discoverableUntil} colors={colors} />

      {isConnected && (
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
          <Pressable
            style={({ pressed }) => [{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: `${colors.accent}15`, borderRadius: 8, paddingVertical: 10, opacity: pressed ? 0.7 : 1 }]}
            onPress={() => onOpen('get')}
          >
            <Eye size={16} color={colors.accent} />
            <Text style={{ fontSize: 13, color: colors.accent, fontFamily: 'Inter_600SemiBold' }}>Read Data</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: `${colors.primary}15`, borderRadius: 8, paddingVertical: 10, opacity: pressed ? 0.7 : 1 }]}
            onPress={() => onOpen('set')}
          >
            <Pencil size={16} color={colors.primary} />
            <Text style={{ fontSize: 13, color: colors.primary, fontFamily: 'Inter_600SemiBold' }}>Configure</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

export default function ConfiguratorScreen() {
  const colors = useColors();
  const { devices, scanning, scan, connect, connectedDeviceId } = useApp();
  const insets = useSafeAreaInsets();
  const headerH = insets.top + (Platform.OS === 'web' ? 67 + 56 : 56);
  const [query, setQuery] = useState('');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const radarAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (scanning) {
      Animated.loop(Animated.timing(radarAnim, { toValue: 1, duration: 1200, easing: Easing.linear, useNativeDriver: true })).start();
    } else {
      radarAnim.setValue(0);
    }
  }, [scanning]);

  const handleScan = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await scan();
  };

  const handleSearch = () => {
    const q = query.trim();
    if (!q) return;
    const info = getDeviceTypeInfo(q);
    if (!info) {
      // toast-like
      return;
    }
    const found = devices.find((d) => d.id === q);
    if (!found) return;
    setHighlightedId(found.id);
  };

  const handleConnect = async (id: string) => {
    await Haptics.trigger('impactLight');
    await connect(id);
  };

  const handleOpen = async (device: BleDevice, mode: string) => {
    if (device.status !== 'connected') {
      await connect(device.id);
    }
    router.push('configurator-device-detail', { id: device.id, mode: mode });
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { paddingTop: headerH + 12, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 80), paddingHorizontal: 16 },
    demoTag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.warningBg, borderRadius: 100, paddingHorizontal: 12, paddingVertical: 5, alignSelf: 'center', marginBottom: 16 },
    demoTagText: { fontSize: 11, color: colors.warning, fontFamily: 'Inter_600SemiBold' },
    scanBtn: { backgroundColor: colors.primary, borderRadius: 14, padding: 20, alignItems: 'center', marginBottom: 16, gap: 6 },
    scanBtnText: { fontSize: 16, fontWeight: '700' as const, color: '#FFFFFF', fontFamily: 'Inter_700Bold' },
    scanSubtext: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter_400Regular' },
    searchRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    searchInput: { flex: 1, height: 46, borderRadius: 10, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, fontSize: 14, color: colors.foreground, backgroundColor: colors.card, fontFamily: 'Inter_400Regular' },
    searchBtn: { width: 46, height: 46, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
    sectionLabel: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 1.5, color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold', textTransform: 'uppercase' as const, marginBottom: 10 },
    emptyBox: { alignItems: 'center', padding: 40, gap: 8 },
    emptyText: { fontSize: 14, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', textAlign: 'center' as const },
  });

  const spin = radarAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={s.container}>
      <AppHeader title="Configurator" back />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <View style={s.demoTag}>
          <Info size={12} color={colors.warning} />
          <Text style={s.demoTagText}>Demo Mode · Timer is simulated</Text>
        </View>

        <Pressable style={({ pressed }) => [s.scanBtn, { opacity: (pressed || scanning) ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]} onPress={handleScan} disabled={scanning}>
          <Animated.View style={scanning ? { transform: [{ rotate: spin }] } : {}}>
            <Wifi size={28} color="rgba(255,255,255,0.9)" />
          </Animated.View>
          <Text style={s.scanBtnText}>{scanning ? 'Scanning for KESCO devices…' : 'Search Nearby Devices'}</Text>
          <Text style={s.scanSubtext}>{scanning ? `${devices.length} found` : 'Tap to start BLE scan'}</Text>
        </Pressable>

        <View style={s.searchRow}>
          <TextInput
            style={s.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Enter Device ID (e.g. 1000002345)"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="numeric"
            onSubmitEditing={handleSearch}
          />
          <Pressable style={s.searchBtn} onPress={handleSearch}>
            <Search size={18} color="#FFFFFF" />
          </Pressable>
        </View>

        <Text style={s.sectionLabel}>Available BLE Devices ({devices.length})</Text>

        {devices.length === 0 ? (
          <View style={s.emptyBox}>
            <Bluetooth size={32} color={colors.mutedForeground} />
            <Text style={s.emptyText}>No nearby KESCO devices.{'\n'}Tap "Search Nearby Devices" to scan.</Text>
          </View>
        ) : (
          devices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              highlighted={device.id === highlightedId}
              onConnect={() => handleConnect(device.id)}
              onOpen={(mode) => handleOpen(device, mode)}
              colors={colors}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
