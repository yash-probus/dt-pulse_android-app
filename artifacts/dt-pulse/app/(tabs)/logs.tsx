import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import useColors from '@/hooks/useColors';
import { AppHeader } from '@/components/AppHeader';

export default function LogsScreen() {
  const colors = useColors();
  const { logs } = useApp();
  const insets = useSafeAreaInsets();
  const headerH = insets.top + (Platform.OS === 'web' ? 67 + 56 : 56);

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { paddingTop: headerH + 16, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 80), paddingHorizontal: 16 },
    logCard: { backgroundColor: colors.card, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    deviceName: { fontSize: 15, fontWeight: '700' as const, color: colors.foreground, fontFamily: 'Inter_700Bold', flex: 1 },
    timestamp: { fontSize: 11, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
    metaText: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginBottom: 10 },
    divider: { height: 1, backgroundColor: colors.border, marginBottom: 10 },
    diffRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
    diffKey: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_500Medium', width: 140 },
    diffOld: { fontSize: 12, color: colors.destructive, fontFamily: 'Inter_400Regular', textDecorationLine: 'line-through' as const },
    diffNew: { fontSize: 12, color: colors.success, fontFamily: 'Inter_600SemiBold' },
    arrow: { fontSize: 12, color: colors.mutedForeground },
    emptyBox: { alignItems: 'center', paddingVertical: 60, gap: 12 },
    emptyText: { fontSize: 15, color: colors.mutedForeground, fontFamily: 'Inter_500Medium' },
    emptySubtext: { fontSize: 13, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', textAlign: 'center' as const },
  });

  const formatKey = (k: string) => k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());

  return (
    <View style={s.container}>
      <AppHeader title="Audit Logs" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {logs.length === 0 ? (
          <View style={s.emptyBox}>
            <Feather name="file-text" size={40} color={colors.mutedForeground} />
            <Text style={s.emptyText}>No logs yet</Text>
            <Text style={s.emptySubtext}>Configuration writes will appear here.</Text>
          </View>
        ) : (
          logs.map((log) => {
            const diffKeys = Object.keys(log.newValues).filter(
              (k) => log.oldValues[k as keyof typeof log.oldValues] !== log.newValues[k as keyof typeof log.newValues]
            );
            return (
              <View key={log.id} style={s.logCard}>
                <View style={s.headerRow}>
                  <Text style={s.deviceName} numberOfLines={1}>{log.deviceName}</Text>
                  <Text style={s.timestamp}>{new Date(log.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
                <Text style={s.metaText}>{log.deviceId} · by {log.engineer}</Text>
                {diffKeys.length > 0 && (
                  <>
                    <View style={s.divider} />
                    {diffKeys.map((k) => (
                      <View key={k} style={s.diffRow}>
                        <Text style={s.diffKey}>{formatKey(k)}</Text>
                        <Text style={s.diffOld}>{String(log.oldValues[k as keyof typeof log.oldValues])}</Text>
                        <Text style={s.arrow}>→</Text>
                        <Text style={s.diffNew}>{String(log.newValues[k as keyof typeof log.newValues])}</Text>
                      </View>
                    ))}
                  </>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
