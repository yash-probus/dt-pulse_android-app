import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {  ChevronUp, ChevronDown, Wifi, WifiOff, Search, Filter  } from '@/utils/icons';
import { router } from '@/utils/router';
import useColors from '@/hooks/useColors';
import { StatusBadge } from '@/components/StatusBadge';
import { HierarchyFilterSheet, type HierarchyFilterValue } from '@/components/HierarchyFilterSheet';
import { DT_LIST, DT_KPIS, type DTListItem } from '../../lib/mockDT';

const EMPTY_HF: HierarchyFilterValue = { circles: [], divisions: [], subDivisions: [] };

// ─── Sub-components ───────────────────────────────────────────────────────────
function LugChip({ label, value, alert, colors }: { label: string; value: string; alert: boolean; colors: any }) {
  return (
    <View style={{ borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: alert ? colors.destructiveBg : colors.muted, alignItems: 'center', flex: 1 }}>
      <Text style={{ fontSize: 10, color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }}>LUG {label}</Text>
      <Text style={{ fontSize: 14, fontWeight: '700' as const, color: alert ? colors.destructive : colors.foreground, fontFamily: 'Inter_700Bold' }}>{value}</Text>
    </View>
  );
}

function DTCard({ dt, expanded, onToggle, colors }: { dt: DTListItem; expanded: boolean; onToggle: () => void; colors: any }) {
  return (
    <View style={{ backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, marginBottom: 10, overflow: 'hidden' }}>
      <Pressable onPress={onToggle} style={{ padding: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Text style={{ fontSize: 15, fontWeight: '700' as const, color: colors.foreground, fontFamily: 'Inter_700Bold', flex: 1 }}>{dt.code}</Text>
          <StatusBadge status={dt.status} small />
          {expanded ? (
            <ChevronUp size={16} color={colors.mutedForeground} style={{ marginLeft: 8 }} />
          ) : (
            <ChevronDown size={16} color={colors.mutedForeground} style={{ marginLeft: 8 }} />
          )}
        </View>
        <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }}>{dt.circle} · {dt.division} · {dt.subDivision}</Text>
        <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }}>{dt.substation} · {dt.kva} · {dt.dtType}</Text>
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
          <LugChip label="R" value={dt.lugR} alert={dt.lugRAlert} colors={colors} />
          <LugChip label="Y" value={dt.lugY} alert={false} colors={colors} />
          <LugChip label="B" value={dt.lugB} alert={false} colors={colors} />
          <LugChip label="N" value={dt.lugN} alert={false} colors={colors} />
        </View>
      </Pressable>

      {expanded && (
        <View style={{ paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1, borderTopColor: colors.border }}>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, marginBottom: 10 }}>
            <View style={{ flex: 1, backgroundColor: colors.background, borderRadius: 8, padding: 10 }}>
              <Text style={{ fontSize: 10, color: colors.mutedForeground, fontFamily: 'Inter_500Medium', textTransform: 'uppercase' as const }}>Oil Temp</Text>
              <Text style={{ fontSize: 16, fontWeight: '700' as const, color: colors.foreground, fontFamily: 'Inter_700Bold' }}>{dt.oilTemp}</Text>
              <Text style={{ fontSize: 10, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 2 }}>{dt.oilTempTs}</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: colors.background, borderRadius: 8, padding: 10 }}>
              <Text style={{ fontSize: 10, color: colors.mutedForeground, fontFamily: 'Inter_500Medium', textTransform: 'uppercase' as const }}>Oil Level</Text>
              <Text style={{ fontSize: 16, fontWeight: '700' as const, color: dt.oilLevel === 'Low' ? colors.warning : colors.foreground, fontFamily: 'Inter_700Bold' }}>{dt.oilLevel}</Text>
              <Text style={{ fontSize: 10, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 2 }}>{dt.oilLevelTs}</Text>
            </View>
          </View>

          {[
            { label: 'Lug Alert',       value: dt.lugAlert,       ts: dt.lugAlertTs },
            { label: 'Oil Temp Alert',  value: dt.oilTempAlert,   ts: dt.oilTempAlertTs },
            { label: 'Oil Level Alert', value: dt.oilLevelAlert,  ts: dt.oilLevelAlertTs },
            { label: 'Outage',          value: dt.outage,         ts: dt.outageTs },
          ].map((row) => (
            <View key={row.label} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_500Medium', flex: 1 }}>{row.label}</Text>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 12, fontWeight: '600' as const, color: (row.value !== 'Normal' && row.value !== '—') ? colors.warning : colors.foreground, fontFamily: 'Inter_600SemiBold' }}>{row.value}</Text>
                <Text style={{ fontSize: 10, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }}>{row.ts}</Text>
              </View>
            </View>
          ))}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }}>
              Updated {dt.updatedMinsAgo} min ago · {dt.gateway}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              {dt.gatewayOnline ? (
                <Wifi size={13} color={colors.success} />
              ) : (
                <WifiOff size={13} color={colors.destructive} />
              )}
              <Text style={{ fontSize: 11, color: dt.gatewayOnline ? colors.success : colors.destructive, fontFamily: 'Inter_500Medium' }}>{dt.gatewayOnline ? 'Online' : 'Offline'}</Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [{ backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginTop: 12, opacity: pressed ? 0.8 : 1 }]}
            onPress={() => router.push('dt-analyzer-detail', { code: dt.code })}
          >
            <Text style={{ fontSize: 13, fontWeight: '600' as const, color: '#FFFFFF', fontFamily: 'Inter_600SemiBold' }}>Open DT Info →</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// ─── DTListTab ────────────────────────────────────────────────────────────────
export default function DTListTab({ paddingTop }: { paddingTop: number }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [search, setSearch]           = useState('');
  const [appliedFilter, setAppliedFilter] = useState<HierarchyFilterValue>(EMPTY_HF);
  const [statusFilter, setStatusFilter]   = useState('');   // separate quick status chip
  const [filterOpen, setFilterOpen]   = useState(false);
  const [expanded, setExpanded]       = useState<string | null>(null);

  const { circles, divisions, subDivisions } = appliedFilter;
  const hierarchyFilterCount = circles.length + divisions.length + subDivisions.length;
  const activeFilterCount    = hierarchyFilterCount + (statusFilter ? 1 : 0);

  const filtered = DT_LIST.filter((dt) => {
    const q = search.toLowerCase();
    const matchSearch   = !q || dt.code.toLowerCase().includes(q) || dt.subDivision.toLowerCase().includes(q) || dt.substation.toLowerCase().includes(q);
    const matchCircle   = !circles.length      || circles.includes(dt.circle);
    const matchDiv      = !divisions.length    || divisions.includes(dt.division);
    const matchSubDiv   = !subDivisions.length || subDivisions.includes(dt.subDivision);
    const matchStatus   = !statusFilter        || dt.status === statusFilter;
    return matchSearch && matchCircle && matchDiv && matchSubDiv && matchStatus;
  });

  const s = StyleSheet.create({
    scroll:      { paddingTop: paddingTop + 12, paddingBottom: insets.bottom + 100, paddingHorizontal: 16 },
    kpiStrip:    { flexDirection: 'row', gap: 6, marginBottom: 14 },
    kpiChip:     { flex: 1, backgroundColor: colors.card, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
    kpiValue:    { fontSize: 18, fontWeight: '700' as const, fontFamily: 'Inter_700Bold' },
    kpiLabel:    { fontSize: 10, color: colors.mutedForeground, fontFamily: 'Inter_500Medium', textTransform: 'uppercase' as const, marginTop: 2 },
    searchRow:   { flexDirection: 'row', gap: 8, marginBottom: 10 },
    searchBox:   { flex: 1, flexDirection: 'row', alignItems: 'center', height: 42, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, paddingHorizontal: 12, gap: 8 },
    searchInput: { flex: 1, fontSize: 14, color: colors.foreground, fontFamily: 'Inter_400Regular' },
    filterBtn:   {
      width: 42, height: 42, borderRadius: 10,
      backgroundColor: hierarchyFilterCount > 0 ? `${colors.primary}15` : colors.card,
      borderWidth: 1, borderColor: hierarchyFilterCount > 0 ? colors.primary : colors.border,
      alignItems: 'center', justifyContent: 'center',
    },
    statusRow:   { flexDirection: 'row', gap: 6, marginBottom: 10 },
    statusChip:  { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
    countText:   { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginBottom: 10 },
  });

  const STATUS_OPTIONS = ['Normal', 'Attention', 'Outage'];

  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* KPI Strip */}
        <View style={s.kpiStrip}>
          <View style={s.kpiChip}>
            <Text style={[s.kpiValue, { color: colors.foreground }]}>1250</Text>
            <Text style={s.kpiLabel}>Total</Text>
          </View>
          <View style={s.kpiChip}>
            <Text style={[s.kpiValue, { color: colors.warning }]}>87</Text>
            <Text style={s.kpiLabel}>Attention</Text>
          </View>
          <View style={s.kpiChip}>
            <Text style={[s.kpiValue, { color: colors.destructive }]}>35</Text>
            <Text style={s.kpiLabel}>Outage</Text>
          </View>
          <View style={s.kpiChip}>
            <Text style={[s.kpiValue, { color: colors.success }]}>1128</Text>
            <Text style={s.kpiLabel}>Normal</Text>
          </View>
        </View>

        {/* Search + Filter */}
        <View style={s.searchRow}>
          <View style={s.searchBox}>
            <Search size={16} color={colors.mutedForeground} />
            <TextInput
              style={s.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search DTs…"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>
          <View style={{ position: 'relative' }}>
            <Pressable style={s.filterBtn} onPress={() => setFilterOpen(true)}>
              <Filter size={18} color={hierarchyFilterCount > 0 ? colors.primary : colors.foreground} />
            </Pressable>
            {hierarchyFilterCount > 0 && (
              <View style={{
                position: 'absolute', top: -4, right: -4,
                minWidth: 16, height: 16, borderRadius: 8,
                backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
              }}>
                <Text style={{ fontSize: 9, color: '#fff', fontFamily: 'Inter_700Bold' }}>{hierarchyFilterCount}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Status quick-filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[s.statusRow, { marginBottom: 10 }]}>
          <Pressable
            style={[s.statusChip, !statusFilter && { borderColor: colors.primary, backgroundColor: `${colors.primary}12` }]}
            onPress={() => setStatusFilter('')}
          >
            <Text style={{ fontSize: 12, fontFamily: 'Inter_500Medium', color: !statusFilter ? colors.primary : colors.foreground }}>All</Text>
          </Pressable>
          {STATUS_OPTIONS.map(opt => {
            const active = statusFilter === opt;
            const col    = opt === 'Normal' ? colors.success : opt === 'Attention' ? colors.warning : colors.destructive;
            return (
              <Pressable
                key={opt}
                style={[s.statusChip, { marginLeft: 6 }, active && { borderColor: col, backgroundColor: `${col}12` }]}
                onPress={() => setStatusFilter(active ? '' : opt)}
              >
                <Text style={{ fontSize: 12, fontFamily: 'Inter_500Medium', color: active ? col : colors.foreground }}>{opt}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Active filter summary */}
        {activeFilterCount > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 }}>
            <Filter size={12} color={colors.primary} />
            <Text style={{ fontSize: 12, color: colors.primary, fontFamily: 'Inter_500Medium', flex: 1 }}>
              {[
                circles.length > 0      && `${circles.length} circle${circles.length > 1 ? 's' : ''}`,
                divisions.length > 0    && `${divisions.length} division${divisions.length > 1 ? 's' : ''}`,
                subDivisions.length > 0 && `${subDivisions.length} sub-division${subDivisions.length > 1 ? 's' : ''}`,
                statusFilter            && `Status: ${statusFilter}`,
              ].filter(Boolean).join(' · ')}
            </Text>
            <Pressable onPress={() => { setAppliedFilter(EMPTY_HF); setStatusFilter(''); }} hitSlop={8}>
              <Text style={{ fontSize: 12, color: colors.destructive, fontFamily: 'Inter_600SemiBold' }}>Clear All</Text>
            </Pressable>
          </View>
        )}

        <Text style={s.countText}>{filtered.length} of {DT_LIST.length} DTs</Text>

        {filtered.length === 0 ? (
          <View style={{ alignItems: 'center', padding: 40, gap: 8 }}>
            <Search size={32} color={colors.mutedForeground} />
            <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 14 }}>No DTs match current filters</Text>
          </View>
        ) : (
          filtered.map((dt) => (
            <DTCard
              key={dt.code}
              dt={dt}
              expanded={expanded === dt.code}
              onToggle={() => setExpanded(expanded === dt.code ? null : dt.code)}
              colors={colors}
            />
          ))
        )}
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
