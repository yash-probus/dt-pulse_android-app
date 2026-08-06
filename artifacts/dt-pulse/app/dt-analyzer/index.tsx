import React, { useState, useEffect } from 'react';
import {
  Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AppHeader }          from '@/components/AppHeader';
import { KpiCard }            from '@/components/KpiCard';
import { SimpleBarChart, GroupedBarChart } from '@/components/SimpleBarChart';
import { HierarchyFilterSheet, type HierarchyFilterValue } from '@/components/HierarchyFilterSheet';
import useColors from '@/hooks/useColors';
import {
  DT_KPIS, SENSOR_KPIS, DT_RATING_DATA, SENSOR_TYPE_DATA,
  ACTIVE_ALERT_SUMMARY, ACTIVE_ALERTS, DT_LIST,
  type ActiveAlert,
} from '@/lib/mockDT';

import DTListTab  from './DTListTab';
import AlertsTab  from './AlertsTab';

type Tab      = 'dashboard' | 'list' | 'alerts';
type DashMode = 'dt' | 'sensor';
type ChartView = 'graph' | 'table';

const ALERTS_PER_PAGE = 10;
const EMPTY_HF: HierarchyFilterValue = { circles: [], divisions: [], subDivisions: [] };

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function DTAnalyzerScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const headerH = insets.top + (Platform.OS === 'web' ? 67 + 56 : 56);
  const [tab, setTab] = useState<Tab>('dashboard');

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    tabRow: {
      position: 'absolute', top: headerH, left: 0, right: 0, zIndex: 99,
      flexDirection: 'row', backgroundColor: colors.card,
      borderBottomWidth: 1, borderBottomColor: colors.border,
      paddingHorizontal: 8, paddingVertical: 6, gap: 4,
    },
    tabBtn:       { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 8, gap: 5 },
    tabBtnActive: { backgroundColor: colors.primary },
    tabLabel:     { fontSize: 12, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  });

  const TAB_H          = 46;
  const contentPaddingTop = headerH + TAB_H + 4;

  return (
    <View style={s.container}>
      <AppHeader title="DT Analyzer" back />
      <View style={s.tabRow}>
        {([
          { key: 'dashboard', label: 'Dashboard', icon: 'grid' },
          { key: 'list',      label: 'DT List',   icon: 'list' },
          { key: 'alerts',    label: 'Alerts',    icon: 'bell' },
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
      {tab === 'list'      && <DTListTab   paddingTop={contentPaddingTop} />}
      {tab === 'alerts'    && <AlertsTab   paddingTop={contentPaddingTop} />}
    </View>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────
function DashboardTab({ paddingTop }: { paddingTop: number }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  // ── Hierarchy filter (multi-select, applied on "Apply Filter") ──
  const [appliedFilter, setAppliedFilter] = useState<HierarchyFilterValue>(EMPTY_HF);
  const [filterOpen, setFilterOpen]       = useState(false);

  // ── Dashboard mode & chart view toggles ──
  const [dashMode,    setDashMode]    = useState<DashMode>('dt');
  const [ratingView,  setRatingView]  = useState<ChartView>('graph');
  const [sensorView,  setSensorView]  = useState<ChartView>('graph');

  // ── Alert UI state ──
  const [selectedAlert,  setSelectedAlert]  = useState<string | null>(null);
  const [alertSearch,    setAlertSearch]    = useState('');
  const [expandedAlert,  setExpandedAlert]  = useState<string | null>(null);
  const [alertPage,      setAlertPage]      = useState(0);

  const { circles, divisions, subDivisions } = appliedFilter;
  const activeFilterCount = circles.length + divisions.length + subDivisions.length;

  // ── Filtered DT list (drives ratio) ──
  const filteredDTs = DT_LIST.filter((dt) => {
    if (circles.length     && !circles.includes(dt.circle))           return false;
    if (divisions.length   && !divisions.includes(dt.division))       return false;
    if (subDivisions.length && !subDivisions.includes(dt.subDivision)) return false;
    return true;
  });
  const ratio = DT_LIST.length > 0 ? filteredDTs.length / DT_LIST.length : 1;

  const filteredDtKpis = {
    total:    Math.max(0, Math.round(DT_KPIS.total    * ratio)),
    live:     Math.max(0, Math.round(DT_KPIS.live     * ratio)),
    inactive: Math.max(0, Math.round(DT_KPIS.inactive * ratio)),
    outage:   Math.max(0, Math.round(DT_KPIS.outage   * ratio)),
  };
  const filteredSensorKpis = {
    active:         Math.max(0, Math.round(SENSOR_KPIS.active         * ratio)),
    inactive:       Math.max(0, Math.round(SENSOR_KPIS.inactive       * ratio)),
    criticalAlarms: Math.max(0, Math.round(SENSOR_KPIS.criticalAlarms * ratio)),
    availability:   SENSOR_KPIS.availability,
  };
  const filteredRatingData = DT_RATING_DATA.map((d) => ({
    label:       d.label,
    live:        Math.max(0, Math.round(d.live        * ratio)),
    outage:      Math.max(0, Math.round(d.outage      * ratio)),
    unavailable: Math.max(0, Math.round(d.unavailable * ratio)),
  }));
  const filteredSensorTypeData = SENSOR_TYPE_DATA.map((d) => ({
    label:    d.label,
    active:   Math.max(0, Math.round(d.active   * ratio)),
    inactive: Math.max(0, Math.round(d.inactive * ratio)),
  }));
  const hierarchyFilteredAlerts = ACTIVE_ALERTS.filter((a) => {
    if (circles.length      && !circles.includes(a.circle))          return false;
    if (divisions.length    && !divisions.includes(a.division))      return false;
    if (subDivisions.length && !subDivisions.includes(a.subDivision)) return false;
    return true;
  });
  const scaledAlertSummary = ACTIVE_ALERT_SUMMARY.map((s) => ({
    ...s,
    count: Math.max(0, Math.round(s.count * ratio)),
  }));

  const filteredAlerts = hierarchyFilteredAlerts.filter((a) => {
    const matchSearch = !alertSearch || [a.dt, a.type, a.subDivision].some(v =>
      v.toLowerCase().includes(alertSearch.toLowerCase())
    );
    const matchKpi = !selectedAlert || a.type === selectedAlert;
    return matchSearch && matchKpi;
  });

  // Reset page when filters or search change
  useEffect(() => { setAlertPage(0); }, [alertSearch, selectedAlert, appliedFilter]);

  const totalPages   = Math.max(1, Math.ceil(filteredAlerts.length / ALERTS_PER_PAGE));
  const pagedAlerts  = filteredAlerts.slice(alertPage * ALERTS_PER_PAGE, (alertPage + 1) * ALERTS_PER_PAGE);

  // ── Styles ──
  const s = StyleSheet.create({
    scroll: {
      paddingTop: paddingTop + 12,
      paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 100),
      paddingHorizontal: 16,
    },
    sectionTitle: {
      fontSize: 12, fontWeight: '700' as const, color: colors.foreground,
      fontFamily: 'Inter_700Bold', textTransform: 'uppercase' as const,
      letterSpacing: 1, marginBottom: 12,
    },
    kpiRow:    { flexDirection: 'row', gap: 8, marginBottom: 8 },
    chartCard: { backgroundColor: colors.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 16 },
    // DT/Sensor toggle row (with filter icon)
    toggleOuter: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    toggleRow:   { flex: 1, flexDirection: 'row', backgroundColor: colors.muted, borderRadius: 10, padding: 3 },
    toggleBtn:   { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    toggleBtnActive: { backgroundColor: colors.card, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
    toggleText:  { fontSize: 13, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
    filterIconBtn: {
      width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
      backgroundColor: activeFilterCount > 0 ? `${colors.primary}15` : colors.card,
      borderWidth: 1, borderColor: activeFilterCount > 0 ? colors.primary : colors.border,
    },
    filterBadge: {
      position: 'absolute', top: -4, right: -4,
      minWidth: 16, height: 16, borderRadius: 8,
      backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
      paddingHorizontal: 3,
    },
    filterBadgeText: { fontSize: 9, color: '#fff', fontFamily: 'Inter_700Bold' },
    // Chart view mini-toggle
    viewToggleRow: { flexDirection: 'row', gap: 4 },
    viewToggleBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: colors.border },
    viewToggleBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    viewToggleText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
    // Table
    tableHeader: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 2, borderBottomColor: colors.border, marginBottom: 4 },
    tableRow:    { flexDirection: 'row', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.border },
    tableCell:   { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', color: colors.foreground },
    tableCellHd: { flex: 1, fontSize: 11, fontFamily: 'Inter_700Bold', color: colors.mutedForeground, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
    // Alerts
    alertKpiScroll: { marginHorizontal: -16, paddingHorizontal: 16 },
    alertKpiCard: { width: 100, borderRadius: 10, padding: 10, marginRight: 8, alignItems: 'center', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
    alertRow:     { backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 8, overflow: 'hidden' },
    alertHeader:  { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 },
    alertDt:      { fontSize: 14, fontWeight: '700' as const, color: colors.foreground, fontFamily: 'Inter_700Bold', flex: 1 },
    alertDetail:  { backgroundColor: colors.background, padding: 12, gap: 6 },
    alertDetailRow:   { flexDirection: 'row', gap: 4 },
    alertDetailLabel: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_500Medium', width: 120 },
    alertDetailValue: { fontSize: 12, color: colors.foreground, fontFamily: 'Inter_400Regular', flex: 1 },
    navBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: colors.primary, borderRadius: 8, marginTop: 8 },
    navBtnText: { fontSize: 12, fontWeight: '600' as const, color: '#FFFFFF', fontFamily: 'Inter_600SemiBold' },
    // Pagination
    paginationRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 12, marginBottom: 4 },
    pageBtn: { minWidth: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, paddingHorizontal: 8 },
    pageBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    pageBtnText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: colors.foreground },
    navArrow: { paddingHorizontal: 6, height: 36, alignItems: 'center', justifyContent: 'center', gap: 4, flexDirection: 'row' },
    navArrowText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  });

  // ── Render helpers ──
  const renderChartToggle = (view: ChartView, setView: (v: ChartView) => void) => (
    <View style={s.viewToggleRow}>
      {(['graph', 'table'] as ChartView[]).map(v => (
        <Pressable key={v} style={[s.viewToggleBtn, view === v && s.viewToggleBtnActive]} onPress={() => setView(v)}>
          <Text style={[s.viewToggleText, { color: view === v ? '#fff' : colors.mutedForeground }]}>
            {v === 'graph' ? 'Graph' : 'Table'}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = Array.from({ length: totalPages }, (_, i) => i);
    return (
      <View style={s.paginationRow}>
        <Pressable
          style={s.navArrow}
          onPress={() => setAlertPage(p => Math.max(0, p - 1))}
          disabled={alertPage === 0}
        >
          <Feather name="chevron-left" size={14} color={alertPage === 0 ? colors.border : colors.foreground} />
          <Text style={[s.navArrowText, { color: alertPage === 0 ? colors.border : colors.foreground }]}>Prev</Text>
        </Pressable>
        {pages.map(p => (
          <Pressable key={p} style={[s.pageBtn, alertPage === p && s.pageBtnActive]} onPress={() => setAlertPage(p)}>
            <Text style={[s.pageBtnText, { color: alertPage === p ? '#fff' : colors.foreground }]}>{p + 1}</Text>
          </Pressable>
        ))}
        <Pressable
          style={s.navArrow}
          onPress={() => setAlertPage(p => Math.min(totalPages - 1, p + 1))}
          disabled={alertPage === totalPages - 1}
        >
          <Text style={[s.navArrowText, { color: alertPage === totalPages - 1 ? colors.border : colors.foreground }]}>Next</Text>
          <Feather name="chevron-right" size={14} color={alertPage === totalPages - 1 ? colors.border : colors.foreground} />
        </Pressable>
      </View>
    );
  };

  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── DT/Sensor toggle + Filter icon ── */}
        <View style={s.toggleOuter}>
          <View style={s.toggleRow}>
            {([
              { key: 'dt',     label: 'DT Overview'     },
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

          {/* Filter icon */}
          <View>
            <Pressable style={s.filterIconBtn} onPress={() => setFilterOpen(true)}>
              <Feather name="filter" size={17} color={activeFilterCount > 0 ? colors.primary : colors.foreground} />
            </Pressable>
            {activeFilterCount > 0 && (
              <View style={s.filterBadge}>
                <Text style={s.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── DT Overview ── */}
        {dashMode === 'dt' ? (
          <>
            <View style={s.kpiRow}>
              <KpiCard label="Total DTs"    value={filteredDtKpis.total}    icon="layers" />
              <KpiCard label="Live DTs"     value={filteredDtKpis.live}     icon="activity"     accent />
            </View>
            <View style={[s.kpiRow, { marginBottom: 16 }]}>
              <KpiCard label="Inactive DTs" value={filteredDtKpis.inactive} icon="minus-circle"  warning />
              <KpiCard label="Under Outage" value={filteredDtKpis.outage}   icon="alert-circle"  danger />
            </View>

            {/* DT Rating Status */}
            <View style={s.chartCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 }}>
                <Text style={[s.sectionTitle, { marginBottom: 0, flex: 1 }]}>DT Rating Status</Text>
                {ratingView === 'graph' && (
                  <Feather name="download" size={16} color={colors.mutedForeground} style={{ marginRight: 4 }} />
                )}
                {renderChartToggle(ratingView, setRatingView)}
              </View>

              {ratingView === 'graph' ? (
                <SimpleBarChart
                  data={filteredRatingData.map((d) => ({
                    label: d.label,
                    values: [
                      { value: d.live,        color: colors.chartBar1, label: 'Live' },
                      { value: d.outage,      color: colors.chartBar2, label: 'Outage' },
                      { value: d.unavailable, color: colors.chartBar3, label: 'Unavailable' },
                    ],
                  }))}
                  legend={[
                    { color: colors.chartBar1, label: 'Live' },
                    { color: colors.chartBar2, label: 'Outage' },
                    { color: colors.chartBar3, label: 'Unavailable' },
                  ]}
                />
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ minWidth: 300 }}>
                    {/* Sticky-style header */}
                    <View style={s.tableHeader}>
                      {['Rating', 'Live', 'Outage', 'Unavailable'].map(h => (
                        <Text key={h} style={s.tableCellHd}>{h}</Text>
                      ))}
                    </View>
                    {filteredRatingData.map((d, i) => (
                      <View key={d.label} style={[s.tableRow, i % 2 === 1 && { backgroundColor: `${colors.muted}50` }]}>
                        <Text style={s.tableCell}>{d.label}</Text>
                        <Text style={[s.tableCell, { color: colors.success, fontFamily: 'Inter_600SemiBold' }]}>{d.live}</Text>
                        <Text style={[s.tableCell, { color: colors.destructive, fontFamily: 'Inter_600SemiBold' }]}>{d.outage}</Text>
                        <Text style={[s.tableCell, { color: colors.warning, fontFamily: 'Inter_600SemiBold' }]}>{d.unavailable}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              )}
            </View>
          </>
        ) : (
          <>
            {/* ── Sensor Overview ── */}
            <View style={s.kpiRow}>
              <KpiCard label="Active Sensors"    value={filteredSensorKpis.active}         icon="radio"          accent />
              <KpiCard label="Inactive Sensors"  value={filteredSensorKpis.inactive}       icon="wifi-off"       warning />
            </View>
            <View style={[s.kpiRow, { marginBottom: 16 }]}>
              <KpiCard label="Critical Alarms"   value={filteredSensorKpis.criticalAlarms} icon="alert-triangle" danger />
              <KpiCard label="Data Availability" value={filteredSensorKpis.availability}   icon="database" />
            </View>

            {/* Sensor Status by Type */}
            <View style={s.chartCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 }}>
                <Text style={[s.sectionTitle, { marginBottom: 0, flex: 1 }]}>Sensor Status by Type</Text>
                {sensorView === 'graph' && (
                  <Feather name="download" size={16} color={colors.mutedForeground} style={{ marginRight: 4 }} />
                )}
                {renderChartToggle(sensorView, setSensorView)}
              </View>

              {sensorView === 'graph' ? (
                <GroupedBarChart
                  data={filteredSensorTypeData.map((d) => ({
                    label: d.label,
                    groups: [
                      { value: d.active,   color: colors.chartBar1 },
                      { value: d.inactive, color: colors.chartBar3 },
                    ],
                  }))}
                  legend={[
                    { color: colors.chartBar1, label: 'Active' },
                    { color: colors.chartBar3, label: 'Inactive' },
                  ]}
                />
              ) : (
                <View>
                  <View style={s.tableHeader}>
                    {['Sensor Type', 'Active', 'Inactive'].map(h => (
                      <Text key={h} style={[s.tableCellHd, h === 'Sensor Type' && { flex: 2 }]}>{h}</Text>
                    ))}
                  </View>
                  {filteredSensorTypeData.map((d, i) => (
                    <View key={d.label} style={[s.tableRow, i % 2 === 1 && { backgroundColor: `${colors.muted}50` }]}>
                      <Text style={[s.tableCell, { flex: 2 }]}>{d.label}</Text>
                      <Text style={[s.tableCell, { color: colors.success, fontFamily: 'Inter_600SemiBold' }]}>{d.active}</Text>
                      <Text style={[s.tableCell, { color: colors.destructive, fontFamily: 'Inter_600SemiBold' }]}>{d.inactive}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        )}

        {/* ── Active Alerts ── */}
        <Text style={s.sectionTitle}>Active Alerts</Text>

        {/* Alert type chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[s.alertKpiScroll, { marginBottom: 12 }]}>
          {selectedAlert && (
            <Pressable
              style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 100, backgroundColor: colors.muted, marginRight: 8, alignSelf: 'center' }}
              onPress={() => setSelectedAlert(null)}
            >
              <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }}>Clear</Text>
            </Pressable>
          )}
          {scaledAlertSummary.map((a) => (
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

        {/* Info row: showing X–Y of Z */}
        {filteredAlerts.length > 0 && (
          <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginBottom: 8 }}>
            Showing {alertPage * ALERTS_PER_PAGE + 1}–{Math.min((alertPage + 1) * ALERTS_PER_PAGE, filteredAlerts.length)} of {filteredAlerts.length} alerts
          </Text>
        )}

        {/* Alert list — paged */}
        {filteredAlerts.length === 0 ? (
          <View style={{ alignItems: 'center', padding: 24 }}>
            <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 14 }}>No alerts</Text>
          </View>
        ) : (
          pagedAlerts.map((a) => (
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
                    { label: 'Circle',            value: a.circle },
                    { label: 'Division',          value: a.division },
                    { label: 'Sub-Division',      value: a.subDivision },
                    { label: 'Alert Type',        value: a.type },
                    { label: 'Description',       value: a.description },
                    { label: 'Alarm Value',       value: a.alarmValue },
                    { label: 'Current Value',     value: a.currentValue },
                    { label: 'Alarm Timestamp',   value: a.alarmTs },
                    { label: 'Current Timestamp', value: a.currentTs },
                  ].map((r) => (
                    <View key={r.label} style={s.alertDetailRow}>
                      <Text style={s.alertDetailLabel}>{r.label}</Text>
                      <Text style={s.alertDetailValue}>{r.value}</Text>
                    </View>
                  ))}
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

        {/* Pagination */}
        {renderPagination()}
      </ScrollView>

      {/* Hierarchy Filter Sheet */}
      <HierarchyFilterSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={setAppliedFilter}
        initial={appliedFilter}
      />
    </>
  );
}
