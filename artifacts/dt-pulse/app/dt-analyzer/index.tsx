import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AppHeader } from '@/components/AppHeader';
import { KpiCard } from '@/components/KpiCard';
import { StatusBadge } from '@/components/StatusBadge';
import { SimpleBarChart, GroupedBarChart } from '@/components/SimpleBarChart';
import useColors from '@/hooks/useColors';
import {
  DT_KPIS, SENSOR_KPIS, DT_RATING_DATA, SENSOR_TYPE_DATA,
  ACTIVE_ALERT_SUMMARY, ACTIVE_ALERTS,
  type ActiveAlert,
} from '@/lib/mockDT';

type Tab = 'dashboard' | 'list' | 'alerts';
type DashMode = 'dt' | 'sensor';

import DTListTab from './DTListTab';
import AlertsTab from './AlertsTab';

export default function DTAnalyzerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const headerH = insets.top + (Platform.OS === 'web' ? 67 + 56 : 56);
  const [tab, setTab] = useState<Tab>('dashboard');

  const tabBarTop = headerH;

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    tabRow: {
      position: 'absolute',
      top: tabBarTop,
      left: 0,
      right: 0,
      zIndex: 99,
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingHorizontal: 8,
      paddingVertical: 6,
      gap: 4,
    },
    tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 8, gap: 5 },
    tabBtnActive: { backgroundColor: colors.primary },
    tabLabel: { fontSize: 12, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  });

  const TAB_H = 46;
  const contentPaddingTop = headerH + TAB_H + 4;

  return (
    <View style={s.container}>
      <AppHeader title="DT Analyzer" back />
      {/* Sub-tab bar */}
      <View style={s.tabRow}>
        {([
          { key: 'dashboard', label: 'Dashboard', icon: 'grid' },
          { key: 'list', label: 'DT List', icon: 'list' },
          { key: 'alerts', label: 'Alerts', icon: 'bell' },
        ] as { key: Tab; label: string; icon: any }[]).map((t) => (
          <Pressable
            key={t.key}
            style={[s.tabBtn, tab === t.key && s.tabBtnActive]}
            onPress={() => setTab(t.key)}
          >
            <Feather name={t.icon} size={14} color={tab === t.key ? '#FFFFFF' : colors.mutedForeground} />
            <Text style={[s.tabLabel, { color: tab === t.key ? '#FFFFFF' : colors.mutedForeground }]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      {tab === 'dashboard' && <DashboardTab paddingTop={contentPaddingTop} />}
      {tab === 'list' && <DTListTab paddingTop={contentPaddingTop} />}
      {tab === 'alerts' && <AlertsTab paddingTop={contentPaddingTop} />}
    </View>
  );
}

// ─── Dashboard Tab ───────────────────────────────────────────────────────────
function DashboardTab({ paddingTop }: { paddingTop: number }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [dashMode, setDashMode] = useState<DashMode>('dt');
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [alertSearch, setAlertSearch] = useState('');
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  const filteredAlerts = ACTIVE_ALERTS.filter((a) => {
    const matchSearch = !alertSearch || [a.dt, a.type, a.subDivision].some((v) =>
      v.toLowerCase().includes(alertSearch.toLowerCase())
    );
    const matchKpi = !selectedAlert || a.type === selectedAlert;
    return matchSearch && matchKpi;
  });

  const s = StyleSheet.create({
    scroll: {
      paddingTop: paddingTop + 12,
      paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 80),
      paddingHorizontal: 16,
    },
    sectionTitle: {
      fontSize: 12, fontWeight: '700' as const, color: colors.foreground,
      fontFamily: 'Inter_700Bold', textTransform: 'uppercase' as const,
      letterSpacing: 1, marginBottom: 12,
    },
    kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
    chartCard: {
      backgroundColor: colors.card, borderRadius: 12, padding: 16,
      borderWidth: 1, borderColor: colors.border, marginBottom: 16,
    },
    // Hierarchy row (kept for context, no Utility card above it)
    hierarchyRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    selectBox: {
      flex: 1, height: 38, borderRadius: 8, borderWidth: 1,
      borderColor: colors.border, backgroundColor: colors.card,
      paddingHorizontal: 10, justifyContent: 'center',
    },
    selectText: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
    // DT / Sensor toggle
    toggleRow: {
      flexDirection: 'row', backgroundColor: colors.muted, borderRadius: 10,
      padding: 3, marginBottom: 16,
    },
    toggleBtn: {
      flex: 1, paddingVertical: 8, borderRadius: 8,
      alignItems: 'center', justifyContent: 'center',
    },
    toggleBtnActive: { backgroundColor: colors.card, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
    toggleText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
    // Alerts
    alertKpiScroll: { marginHorizontal: -16, paddingHorizontal: 16 },
    alertKpiCard: {
      width: 100, borderRadius: 10, padding: 10, marginRight: 8,
      alignItems: 'center', borderWidth: 1, borderColor: colors.border,
      backgroundColor: colors.card,
    },
    alertRow: {
      backgroundColor: colors.card, borderRadius: 12, borderWidth: 1,
      borderColor: colors.border, marginBottom: 8, overflow: 'hidden',
    },
    alertHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 },
    alertDt: { fontSize: 14, fontWeight: '700' as const, color: colors.foreground, fontFamily: 'Inter_700Bold', flex: 1 },
    alertDetail: { backgroundColor: colors.background, padding: 12, gap: 6 },
    alertDetailRow: { flexDirection: 'row', gap: 4 },
    alertDetailLabel: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_500Medium', width: 120 },
    alertDetailValue: { fontSize: 12, color: colors.foreground, fontFamily: 'Inter_400Regular', flex: 1 },
    navBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 6, paddingVertical: 8, paddingHorizontal: 14,
      backgroundColor: colors.primary, borderRadius: 8, marginTop: 8,
    },
    navBtnText: { fontSize: 12, fontWeight: '600' as const, color: '#FFFFFF', fontFamily: 'Inter_600SemiBold' },
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

      {/* DT Overview / Sensor Overview toggle */}
      <View style={s.toggleRow}>
        {([
          { key: 'dt', label: 'DT Overview' },
          { key: 'sensor', label: 'Sensor Overview' },
        ] as { key: DashMode; label: string }[]).map((m) => (
          <Pressable
            key={m.key}
            style={[s.toggleBtn, dashMode === m.key && s.toggleBtnActive]}
            onPress={() => setDashMode(m.key)}
          >
            <Text style={[s.toggleText, { color: dashMode === m.key ? colors.primary : colors.mutedForeground }]}>
              {m.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {dashMode === 'dt' ? (
        <>
          {/* DT KPIs */}
          <View style={s.kpiRow}>
            <KpiCard label="Total DTs" value={DT_KPIS.total} icon="layers" />
            <KpiCard label="Live DTs" value={DT_KPIS.live} icon="activity" accent />
          </View>
          <View style={[s.kpiRow, { marginBottom: 16 }]}>
            <KpiCard label="Inactive DTs" value={DT_KPIS.inactive} icon="minus-circle" warning />
            <KpiCard label="Under Outage" value={DT_KPIS.outage} icon="alert-circle" danger />
          </View>

          {/* DT Rating Status Chart */}
          <View style={s.chartCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={s.sectionTitle}>DT Rating Status</Text>
              <Feather name="download" size={16} color={colors.mutedForeground} />
            </View>
            <SimpleBarChart
              data={DT_RATING_DATA.map((d) => ({
                label: d.label,
                values: [
                  { value: d.live, color: colors.chartBar1, label: 'Live' },
                  { value: d.outage, color: colors.chartBar2, label: 'Outage' },
                  { value: d.unavailable, color: colors.chartBar3, label: 'Unavailable' },
                ],
              }))}
              legend={[
                { color: colors.chartBar1, label: 'Live' },
                { color: colors.chartBar2, label: 'Outage' },
                { color: colors.chartBar3, label: 'Unavailable' },
              ]}
            />
          </View>
        </>
      ) : (
        <>
          {/* Sensor KPIs */}
          <View style={s.kpiRow}>
            <KpiCard label="Active Sensors" value={SENSOR_KPIS.active} icon="radio" accent />
            <KpiCard label="Inactive Sensors" value={SENSOR_KPIS.inactive} icon="wifi-off" warning />
          </View>
          <View style={[s.kpiRow, { marginBottom: 16 }]}>
            <KpiCard label="Critical Alarms" value={SENSOR_KPIS.criticalAlarms} icon="alert-triangle" danger />
            <KpiCard label="Data Availability" value={SENSOR_KPIS.availability} icon="database" />
          </View>

          {/* Sensor Status By Type */}
          <View style={s.chartCard}>
            <Text style={[s.sectionTitle, { marginBottom: 12 }]}>Sensor Status by Type</Text>
            <GroupedBarChart
              data={SENSOR_TYPE_DATA.map((d) => ({
                label: d.label,
                groups: [
                  { value: d.active, color: colors.chartBar1 },
                  { value: d.inactive, color: colors.chartBar3 },
                ],
              }))}
              legend={[
                { color: colors.chartBar1, label: 'Active' },
                { color: colors.chartBar3, label: 'Inactive' },
              ]}
            />
          </View>
        </>
      )}

      {/* Active Alerts section — always visible */}
      <Text style={s.sectionTitle}>Active Alerts</Text>

      {/* Alert type filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[s.alertKpiScroll, { marginBottom: 12 }]}>
        {selectedAlert && (
          <Pressable
            style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 100, backgroundColor: colors.muted, marginRight: 8, alignSelf: 'center' }}
            onPress={() => setSelectedAlert(null)}
          >
            <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }}>Clear</Text>
          </Pressable>
        )}
        {ACTIVE_ALERT_SUMMARY.map((a) => (
          <Pressable
            key={a.type}
            style={[s.alertKpiCard, selectedAlert === a.type && { borderColor: a.color, backgroundColor: `${a.color}10` }]}
            onPress={() => setSelectedAlert(selectedAlert === a.type ? null : a.type)}
          >
            <Text style={{ fontSize: 22, fontWeight: '700' as const, color: a.color, fontFamily: 'Inter_700Bold' }}>{a.count}</Text>
            <Text style={{ fontSize: 10, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', textAlign: 'center', marginTop: 4 }} numberOfLines={2}>{a.type}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Alert search */}
      <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, height: 42, backgroundColor: colors.card, marginBottom: 12, gap: 8 }}>
        <Feather name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          style={{ flex: 1, fontSize: 14, color: colors.foreground, fontFamily: 'Inter_400Regular' }}
          value={alertSearch}
          onChangeText={setAlertSearch}
          placeholder="Search alerts..."
          placeholderTextColor={colors.mutedForeground}
        />
      </View>

      {/* Alert list — tap navigates directly to DT Info */}
      {filteredAlerts.length === 0 ? (
        <View style={{ alignItems: 'center', padding: 24 }}>
          <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 14 }}>No alerts</Text>
        </View>
      ) : (
        filteredAlerts.map((a) => (
          <View key={a.id} style={s.alertRow}>
            <Pressable
              style={s.alertHeader}
              onPress={() => setExpandedAlert(expandedAlert === a.id ? null : a.id)}
            >
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: a.severity === 'critical' ? colors.destructive : colors.warning, marginRight: 4 }} />
              <Text style={s.alertDt}>{a.dt}</Text>
              <Text style={{ fontSize: 11, color: a.severity === 'critical' ? colors.destructive : colors.warning, fontFamily: 'Inter_600SemiBold' }}>{a.type}</Text>
              <Feather name={expandedAlert === a.id ? 'chevron-up' : 'chevron-down'} size={14} color={colors.mutedForeground} />
            </Pressable>

            {expandedAlert === a.id && (
              <View style={s.alertDetail}>
                {[
                  { label: 'Circle', value: a.circle },
                  { label: 'Division', value: a.division },
                  { label: 'Sub-Division', value: a.subDivision },
                  { label: 'Alert Type', value: a.type },
                  { label: 'Description', value: a.description },
                  { label: 'Alarm Value', value: a.alarmValue },
                  { label: 'Current Value', value: a.currentValue },
                  { label: 'Alarm Timestamp', value: a.alarmTs },
                  { label: 'Current Timestamp', value: a.currentTs },
                ].map((r) => (
                  <View key={r.label} style={s.alertDetailRow}>
                    <Text style={s.alertDetailLabel}>{r.label}</Text>
                    <Text style={s.alertDetailValue}>{r.value}</Text>
                  </View>
                ))}

                {/* Navigate to DT Info */}
                <Pressable
                  style={({ pressed }) => [s.navBtn, { opacity: pressed ? 0.8 : 1 }]}
                  onPress={() => router.push(`/dt-analyzer/dt/${a.dt}?alertId=${a.id}` as any)}
                >
                  <Feather name="external-link" size={13} color="#FFFFFF" />
                  <Text style={s.navBtnText}>Open {a.dt} →</Text>
                </Pressable>
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}
