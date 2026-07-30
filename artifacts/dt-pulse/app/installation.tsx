import React from 'react';
import { Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import useColors from '@/hooks/useColors';
import { AppHeader } from '@/components/AppHeader';

const FEATURES = [
  'Step-by-step installation checklists',
  'Barcode / serial capture for assets',
  'Auto-commission via BLE handshake',
  'Digital sign-off with engineer signature',
];

export default function InstallationScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const headerH = insets.top + (Platform.OS === 'web' ? 67 + 56 : 56);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader title="Installation App" back />
      <ScrollView contentContainerStyle={{ paddingTop: headerH + 40, paddingHorizontal: 24, alignItems: 'center' as const, paddingBottom: insets.bottom + 40 }}>
        <View style={{ width: 80, height: 80, borderRadius: 20, backgroundColor: `${colors.accent}15`, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Feather name="tool" size={36} color={colors.accent} />
        </View>
        <Text style={{ fontSize: 24, fontWeight: '700' as const, color: colors.foreground, fontFamily: 'Inter_700Bold', marginBottom: 8 }}>Installation App</Text>
        <View style={{ backgroundColor: colors.muted, borderRadius: 100, paddingHorizontal: 14, paddingVertical: 5, marginBottom: 20 }}>
          <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }}>Coming Soon</Text>
        </View>
        <Text style={{ fontSize: 14, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', textAlign: 'center', marginBottom: 28, lineHeight: 22 }}>
          This module is under development. The following features are planned:
        </Text>
        {FEATURES.map((f, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12, alignSelf: 'flex-start' as const }}>
            <Feather name="check-circle" size={16} color={colors.success} />
            <Text style={{ fontSize: 14, color: colors.foreground, fontFamily: 'Inter_400Regular' }}>{f}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
