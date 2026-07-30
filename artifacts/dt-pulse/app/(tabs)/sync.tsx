import React, { useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/context/AppContext';
import useColors from '@/hooks/useColors';
import { AppHeader } from '@/components/AppHeader';

export default function SyncScreen() {
  const colors = useColors();
  const { logs, lastSyncAt, syncLogs } = useApp();
  const insets = useSafeAreaInsets();
  const [syncing, setSyncing] = useState(false);
  const headerH = insets.top + (Platform.OS === 'web' ? 67 + 56 : 56);

  const pending = logs.filter((l) => !l.synced).length;

  const handleSync = async () => {
    if (pending === 0) return;
    setSyncing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await syncLogs();
    setSyncing(false);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const formatSyncTime = () => {
    if (!lastSyncAt) return 'Never synced';
    const d = new Date(lastSyncAt);
    return 'Last sync ' + d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { paddingTop: headerH + 16, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 80), paddingHorizontal: 16 },
    pendingCard: { borderRadius: 16, padding: 24, marginBottom: 20, alignItems: 'center' },
    pendingLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', letterSpacing: 1.5, fontFamily: 'Inter_600SemiBold', textTransform: 'uppercase' as const },
    pendingCount: { fontSize: 56, fontWeight: '700' as const, color: '#FFFFFF', fontFamily: 'Inter_700Bold', letterSpacing: -2 },
    pendingSubtext: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontFamily: 'Inter_400Regular', marginTop: 4 },
    syncBtn: { height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginBottom: 24 },
    syncBtnText: { fontSize: 15, fontWeight: '600' as const, color: colors.primary, fontFamily: 'Inter_600SemiBold' },
    sectionHeader: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 1.5, color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold', marginBottom: 12, textTransform: 'uppercase' as const },
    logRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
    logName: { fontSize: 14, fontWeight: '600' as const, color: colors.foreground, fontFamily: 'Inter_600SemiBold' },
    logMeta: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 2 },
    pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100, marginLeft: 'auto' as const },
    pillText: { fontSize: 11, fontWeight: '600' as const, fontFamily: 'Inter_600SemiBold' },
    emptyBox: { alignItems: 'center', paddingVertical: 40, gap: 8 },
    emptyText: { fontSize: 14, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', textAlign: 'center' as const },
  });

  return (
    <View style={s.container}>
      <AppHeader title="Sync Center" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <LinearGradient colors={['#0B2545', '#1B5E85']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.pendingCard}>
          <Text style={s.pendingLabel}>Pending</Text>
          <Text style={s.pendingCount}>{pending}</Text>
          <Text style={s.pendingSubtext}>{formatSyncTime()}</Text>
        </LinearGradient>

        <Pressable
          style={({ pressed }) => [s.syncBtn, { opacity: (pressed || syncing || pending === 0) ? 0.7 : 1 }]}
          onPress={handleSync}
          disabled={syncing || pending === 0}
        >
          {syncing ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Feather name="upload-cloud" size={18} color={colors.primary} />
              <Text style={s.syncBtnText}>Sync Now</Text>
            </View>
          )}
        </Pressable>

        <Text style={s.sectionHeader}>Recent Activity</Text>

        {logs.length === 0 ? (
          <View style={s.emptyBox}>
            <Feather name="inbox" size={32} color={colors.mutedForeground} />
            <Text style={s.emptyText}>No activity yet.{'\n'}Write a configuration to see it here.</Text>
          </View>
        ) : (
          logs.slice(0, 10).map((log) => (
            <View key={log.id} style={s.logRow}>
              <Feather
                name={log.synced ? 'check-circle' : 'clock'}
                size={18}
                color={log.synced ? colors.success : colors.warning}
                style={{ marginRight: 12 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={s.logName} numberOfLines={1}>{log.deviceName}</Text>
                <Text style={s.logMeta}>{log.deviceId} · {new Date(log.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
              <View style={[s.pill, { backgroundColor: log.synced ? colors.successBg : colors.warningBg }]}>
                <Text style={[s.pillText, { color: log.synced ? colors.success : colors.warning }]}>{log.synced ? 'synced' : 'pending'}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
