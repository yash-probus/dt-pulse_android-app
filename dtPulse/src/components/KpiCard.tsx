import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import useColors from '@/hooks/useColors';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  accent?: boolean;
  danger?: boolean;
  warning?: boolean;
}

export function KpiCard({ label, value, icon: Icon, iconColor, accent, danger, warning }: KpiCardProps) {
  const colors = useColors();

  const bgColor = danger ? colors.destructiveBg : warning ? colors.warningBg : accent ? `${colors.accent}15` : colors.card;
  const valueColor = danger ? colors.destructive : warning ? colors.warning : accent ? colors.accent : colors.foreground;
  const resolvedIconColor = iconColor ?? (danger ? colors.destructive : warning ? colors.warning : accent ? colors.accent : colors.mutedForeground);

  return (
    <View style={[s.card, { backgroundColor: bgColor, borderColor: colors.border }]}>
      <View style={[s.iconCircle, { backgroundColor: `${resolvedIconColor}18` }]}>
        <Icon size={18} color={resolvedIconColor} />
      </View>
      <Text style={[s.value, { color: valueColor, fontFamily: 'Inter_700Bold' }]}>{value}</Text>
      <Text style={[s.label, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    minHeight: 90,
    gap: 4,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  value: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.5 },
  label: { fontSize: 11, fontWeight: '500' as const, letterSpacing: 0.3, textTransform: 'uppercase' as const },
});
