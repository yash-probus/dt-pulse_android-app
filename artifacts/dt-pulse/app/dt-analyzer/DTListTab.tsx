import React, { useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import useColors from '@/hooks/useColors';
import { StatusBadge } from '@/components/StatusBadge';
import { DT_LIST, HIERARCHY, type DTListItem } from '@/lib/mockDT';

interface Filters {
  circle: string;
  division: string;
  subDivision: string;
  status: string;
}

const EMPTY_FILTERS: Filters = { circle: '', division: '', subDivision: '', status: '' };

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
          <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.mutedForeground} style={{ marginLeft: 8 }} />
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
            { label: 'Lug Alert', value: dt.lugAlert, ts: dt.lugAlertTs },
            { label: 'Oil Temp Alert', value: dt.oilTempAlert, ts: dt.oilTempAlertTs },
            { label: 'Oil Level Alert', value: dt.oilLevelAlert, ts: dt.oilLevelAlertTs },
            { label: 'Outage', value: dt.outage, ts: dt.outageTs },
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
              <Feather name={dt.gatewayOnline ? 'wifi' : 'wifi-off'} size={13} color={dt.gatewayOnline ? colors.success : colors.destructive} />
              <Text style={{ fontSize: 11, color: dt.gatewayOnline ? colors.success : colors.destructive, fontFamily: 'Inter_500Medium' }}>{dt.gatewayOnline ? 'Online' : 'Offline'}</Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [{ backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginTop: 12, opacity: pressed ? 0.8 : 1 }]}
            onPress={() => router.push(`/dt-analyzer/dt/${dt.code}` as any)}
          >
            <Text style={{ fontSize: 13, fontWeight: '600' as const, color: '#FFFFFF', fontFamily: 'Inter_600SemiBold' }}>Open DT Info →</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

export default function DTListTab({ paddingTop }: { paddingTop: number }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [pendingFilters, setPendingFilters] = useState<Filters>(EMPTY_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const activeFilterCount = Object.values(filters).filter((v) => v !== '').length;

  // Cascading options
  const availableDivisions = pendingFilters.circle
    ? (HIERARCHY.divisions[pendingFilters.circle] ?? [])
    : [];
  const availableSubDivisions = pendingFilters.division
    ? (HIERARCHY.subDivisions[pendingFilters.division] ?? [])
    : [];

  const filtered = DT_LIST.filter((dt) => {
    const q = search.toLowerCase();
    const matchSearch = !q || dt.code.toLowerCase().includes(q) || dt.subDivision.toLowerCase().includes(q) || dt.substation.toLowerCase().includes(q);
    const matchCircle = !filters.circle || dt.circle === filters.circle;
    const matchDiv = !filters.division || dt.division === filters.division;
    const matchSubDiv = !filters.subDivision || dt.subDivision === filters.subDivision;
    const matchStatus = !filters.status || dt.status === filters.status;
    return matchSearch && matchCircle && matchDiv && matchSubDiv && matchStatus;
  });

  const s = StyleSheet.create({
    scroll: { paddingTop: paddingTop + 12, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 80), paddingHorizontal: 16 },
    kpiStrip: { flexDirection: 'row', gap: 6, marginBottom: 14 },
    kpiChip: { flex: 1, backgroundColor: colors.card, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
    kpiValue: { fontSize: 18, fontWeight: '700' as const, fontFamily: 'Inter_700Bold' },
    kpiLabel: { fontSize: 10, color: colors.mutedForeground, fontFamily: 'Inter_500Medium', textTransform: 'uppercase' as const, marginTop: 2 },
    searchRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', height: 42, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, paddingHorizontal: 12, gap: 8 },
    searchInput: { flex: 1, fontSize: 14, color: colors.foreground, fontFamily: 'Inter_400Regular' },
    filterBtn: { width: 42, height: 42, borderRadius: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
    countText: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginBottom: 10 },
    modal: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay },
    sheet: { backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: insets.bottom + 24, maxHeight: '90%' },
    sheetTitle: { fontSize: 18, fontWeight: '700' as const, color: colors.foreground, fontFamily: 'Inter_700Bold', marginBottom: 16 },
    sheetLabel: { fontSize: 11, fontWeight: '600' as const, color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold', textTransform: 'uppercase' as const, marginBottom: 6 },
    sheetBtnRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
    sheetBtn: { flex: 1, height: 46, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    // Cascade selector
    cascadeStep: { marginBottom: 14 },
    cascadeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    stepCircle: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
    stepNum: { fontSize: 11, fontWeight: '700' as const, color: '#FFFFFF', fontFamily: 'Inter_700Bold' },
    optionPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, borderWidth: 1, marginRight: 6, marginBottom: 6 },
    optionText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  });

  const setPendingCircle = (val: string) =>
    setPendingFilters((f) => ({ ...f, circle: val, division: '', subDivision: '' }));
  const setPendingDivision = (val: string) =>
    setPendingFilters((f) => ({ ...f, division: val, subDivision: '' }));
  const setPendingSubDiv = (val: string) =>
    setPendingFilters((f) => ({ ...f, subDivision: val }));
  const setPendingStatus = (val: string) =>
    setPendingFilters((f) => ({ ...f, status: val }));

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

        {/* Search & Filter */}
        <View style={s.searchRow}>
          <View style={s.searchBox}>
            <Feather name="search" size={16} color={colors.mutedForeground} />
            <TextInput style={s.searchInput} value={search} onChangeText={setSearch} placeholder="Search DTs..." placeholderTextColor={colors.mutedForeground} />
          </View>
          <Pressable style={s.filterBtn} onPress={() => { setPendingFilters(filters); setFilterOpen(true); }}>
            <Feather name="filter" size={18} color={activeFilterCount > 0 ? colors.accent : colors.foreground} />
          </Pressable>
        </View>

        <Text style={s.countText}>{filtered.length} of {DT_LIST.length} DTs</Text>

        {filtered.length === 0 ? (
          <View style={{ alignItems: 'center', padding: 40, gap: 8 }}>
            <Feather name="search" size={32} color={colors.mutedForeground} />
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

      {/* Filter Sheet */}
      <Modal visible={filterOpen} transparent animationType="slide" onRequestClose={() => setFilterOpen(false)}>
        <Pressable style={s.modal} onPress={() => setFilterOpen(false)}>
          <Pressable style={s.sheet} onPress={() => {}}>
            <Text style={s.sheetTitle}>Filter DTs</Text>
            <ScrollView showsVerticalScrollIndicator={false}>

              {/* Step 1: Circle */}
              <View style={s.cascadeStep}>
                <View style={s.cascadeHeader}>
                  <View style={s.stepCircle}><Text style={s.stepNum}>1</Text></View>
                  <Text style={s.sheetLabel}>Circle</Text>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {['', ...HIERARCHY.circles].map((opt) => {
                    const active = pendingFilters.circle === opt;
                    return (
                      <Pressable
                        key={opt || '__all__'}
                        style={[s.optionPill, { borderColor: active ? colors.accent : colors.border, backgroundColor: active ? `${colors.accent}15` : colors.card }]}
                        onPress={() => setPendingCircle(opt)}
                      >
                        <Text style={[s.optionText, { color: active ? colors.accent : colors.foreground }]}>{opt || 'All'}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Step 2: Division — enabled only after Circle */}
              <View style={[s.cascadeStep, !pendingFilters.circle && { opacity: 0.4 }]}>
                <View style={s.cascadeHeader}>
                  <View style={[s.stepCircle, !pendingFilters.circle && { backgroundColor: colors.mutedForeground }]}>
                    <Text style={s.stepNum}>2</Text>
                  </View>
                  <Text style={s.sheetLabel}>Division</Text>
                </View>
                {pendingFilters.circle ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {['', ...availableDivisions].map((opt) => {
                      const active = pendingFilters.division === opt;
                      return (
                        <Pressable
                          key={opt || '__all__'}
                          style={[s.optionPill, { borderColor: active ? colors.accent : colors.border, backgroundColor: active ? `${colors.accent}15` : colors.card }]}
                          onPress={() => setPendingDivision(opt)}
                        >
                          <Text style={[s.optionText, { color: active ? colors.accent : colors.foreground }]}>{opt || 'All'}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : (
                  <Text style={{ fontSize: 13, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }}>Select a Circle first</Text>
                )}
              </View>

              {/* Step 3: Sub-Division — enabled only after Division */}
              <View style={[s.cascadeStep, !pendingFilters.division && { opacity: 0.4 }]}>
                <View style={s.cascadeHeader}>
                  <View style={[s.stepCircle, !pendingFilters.division && { backgroundColor: colors.mutedForeground }]}>
                    <Text style={s.stepNum}>3</Text>
                  </View>
                  <Text style={s.sheetLabel}>Sub-Division</Text>
                </View>
                {pendingFilters.division ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {['', ...availableSubDivisions].map((opt) => {
                      const active = pendingFilters.subDivision === opt;
                      return (
                        <Pressable
                          key={opt || '__all__'}
                          style={[s.optionPill, { borderColor: active ? colors.accent : colors.border, backgroundColor: active ? `${colors.accent}15` : colors.card }]}
                          onPress={() => setPendingSubDiv(opt)}
                        >
                          <Text style={[s.optionText, { color: active ? colors.accent : colors.foreground }]}>{opt || 'All'}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : (
                  <Text style={{ fontSize: 13, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }}>Select a Division first</Text>
                )}
              </View>

              {/* DT Status */}
              <View style={s.cascadeStep}>
                <View style={s.cascadeHeader}>
                  <View style={[s.stepCircle, { backgroundColor: colors.mutedForeground }]}>
                    <Text style={s.stepNum}>4</Text>
                  </View>
                  <Text style={s.sheetLabel}>DT Status</Text>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {['', 'Normal', 'Attention', 'Outage'].map((opt) => {
                    const active = pendingFilters.status === opt;
                    return (
                      <Pressable
                        key={opt || '__all__'}
                        style={[s.optionPill, { borderColor: active ? colors.accent : colors.border, backgroundColor: active ? `${colors.accent}15` : colors.card }]}
                        onPress={() => setPendingStatus(opt)}
                      >
                        <Text style={[s.optionText, { color: active ? colors.accent : colors.foreground }]}>{opt || 'All'}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

            </ScrollView>

            <View style={s.sheetBtnRow}>
              <Pressable style={[s.sheetBtn, { backgroundColor: colors.muted }]} onPress={() => setPendingFilters(EMPTY_FILTERS)}>
                <Text style={{ color: colors.foreground, fontFamily: 'Inter_600SemiBold' }}>Clear Filters</Text>
              </Pressable>
              <Pressable style={[s.sheetBtn, { backgroundColor: colors.primary }]} onPress={() => { setFilters(pendingFilters); setFilterOpen(false); }}>
                <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_600SemiBold' }}>Apply Filters</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
