import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import useColors from '@/hooks/useColors';

interface BarData {
  label: string;
  values: { value: number; color: string; label: string }[];
}

interface SimpleBarChartProps {
  data: BarData[];
  height?: number;
  legend?: { color: string; label: string }[];
}

export function SimpleBarChart({ data, height = 140, legend }: SimpleBarChartProps) {
  const colors = useColors();

  const maxTotal = Math.max(...data.map((d) => d.values.reduce((s, v) => s + v.value, 0)));

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, height, paddingBottom: 24 }}>
        {data.map((bar, i) => {
          const total = bar.values.reduce((s, v) => s + v.value, 0);
          const barH = maxTotal > 0 ? ((total / maxTotal) * (height - 28)) : 0;
          let acc = 0;
          return (
            <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: height - 24 }}>
              <View style={{ width: '75%', height: barH, overflow: 'hidden', borderRadius: 4 }}>
                {bar.values.map((seg, j) => {
                  const segH = total > 0 ? (seg.value / total) * barH : 0;
                  return (
                    <View key={j} style={{ height: segH, backgroundColor: seg.color, width: '100%' }} />
                  );
                })}
              </View>
              <Text style={{ fontSize: 9, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 4, textAlign: 'center' }} numberOfLines={2}>
                {bar.label}
              </Text>
            </View>
          );
        })}
      </View>

      {legend && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 }}>
          {legend.map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: item.color }} />
              <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }}>{item.label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

interface GroupedBarData {
  label: string;
  groups: { value: number; color: string }[];
}

export function GroupedBarChart({ data, height = 120, legend }: { data: GroupedBarData[]; height?: number; legend?: { color: string; label: string }[] }) {
  const colors = useColors();
  const maxVal = Math.max(...data.flatMap((d) => d.groups.map((g) => g.value)));

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12, height, paddingBottom: 24 }}>
        {data.map((bar, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: height - 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, width: '90%' }}>
              {bar.groups.map((g, j) => {
                const barH = maxVal > 0 ? (g.value / maxVal) * (height - 30) : 0;
                return (
                  <View key={j} style={{ flex: 1, height: barH, backgroundColor: g.color, borderRadius: 3 }} />
                );
              })}
            </View>
            <Text style={{ fontSize: 9, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 4, textAlign: 'center' }}>
              {bar.label}
            </Text>
          </View>
        ))}
      </View>
      {legend && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 }}>
          {legend.map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: item.color }} />
              <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }}>{item.label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
