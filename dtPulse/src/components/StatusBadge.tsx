import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import useColors from '@/hooks/useColors';

interface StatusBadgeProps {
  status: 'Normal' | 'Attention' | 'Outage' | 'SOON' | 'Online' | 'Offline' | string;
  small?: boolean;
}

export function StatusBadge({ status, small }: StatusBadgeProps) {
  const colors = useColors();

  const config: Record<string, { bg: string; text: string; label: string }> = {
    Normal: { bg: colors.successBg, text: colors.success, label: 'NORMAL' },
    NORMAL: { bg: colors.successBg, text: colors.success, label: 'NORMAL' },
    Attention: { bg: colors.warningBg, text: colors.warning, label: 'ATTENTION' },
    ATTENTION: { bg: colors.warningBg, text: colors.warning, label: 'ATTENTION' },
    Outage: { bg: colors.destructiveBg, text: colors.destructive, label: 'OUTAGE' },
    OUTAGE: { bg: colors.destructiveBg, text: colors.destructive, label: 'OUTAGE' },
    SOON: { bg: colors.muted, text: colors.mutedForeground, label: 'SOON' },
    Online: { bg: colors.successBg, text: colors.success, label: 'ONLINE' },
    Offline: { bg: colors.destructiveBg, text: colors.destructive, label: 'OFFLINE' },
  };

  const { bg, text, label } = config[status] ?? { bg: colors.muted, text: colors.mutedForeground, label: status.toUpperCase() };

  return (
    <View style={[s.badge, { backgroundColor: bg }, small && s.small]}>
      <Text style={[s.text, { color: text }, small && s.smallText]}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  badge: { borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' as const },
  small: { paddingHorizontal: 6, paddingVertical: 2 },
  text: { fontSize: 10, fontWeight: '700' as const, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
  smallText: { fontSize: 9 },
});
