
import React, { useState, useMemo } from 'react';
import {
  Modal, Pressable, ScrollView, StyleSheet,
  Text, TextInput, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {  X, Search, CircleX, Check  } from '@/utils/icons';
import useColors from '@/hooks/useColors';
import { HIERARCHY } from '@/lib/mockDT';

type Category = 'circle' | 'division' | 'subdivision';

export interface HierarchyFilterValue {
  circles: string[];
  divisions: string[];
  subDivisions: string[];
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onApply: (value: HierarchyFilterValue) => void;
  initial: HierarchyFilterValue;
}

const CATEGORY_LABELS: Record<Category, string> = {
  circle:      'Circle',
  division:    'Division',
  subdivision: 'Sub-Division',
};

export function HierarchyFilterSheet({ visible, onClose, onApply, initial }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [activeCategory, setActiveCategory]     = useState<Category>('circle');
  const [pendingCircles, setPendingCircles]       = useState<string[]>([]);
  const [pendingDivisions, setPendingDivisions]   = useState<string[]>([]);
  const [pendingSubDivisions, setPendingSubDivisions] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  /* sync with initial when modal opens */
  const handleShow = () => {
    setPendingCircles(initial.circles);
    setPendingDivisions(initial.divisions);
    setPendingSubDivisions(initial.subDivisions);
    setActiveCategory('circle');
    setSearch('');
  };

  /* cascading available options */
  const availableDivisions = useMemo(() =>
    pendingCircles.length > 0
      ? pendingCircles.flatMap(c => HIERARCHY.divisions[c] ?? [])
      : Object.values(HIERARCHY.divisions).flat()
  , [pendingCircles]);

  const availableSubDivisions = useMemo(() =>
    pendingDivisions.length > 0
      ? pendingDivisions.flatMap(d => HIERARCHY.subDivisions[d] ?? [])
      : availableDivisions.flatMap(d => HIERARCHY.subDivisions[d] ?? [])
  , [pendingDivisions, availableDivisions]);

  const allOptions: string[] = useMemo(() => {
    if (activeCategory === 'circle')      return HIERARCHY.circles;
    if (activeCategory === 'division')    return availableDivisions;
    return availableSubDivisions;
  }, [activeCategory, availableDivisions, availableSubDivisions]);

  const filteredOptions = useMemo(() =>
    allOptions.filter(o => !search || o.toLowerCase().includes(search.toLowerCase()))
  , [allOptions, search]);

  const selected: string[] = activeCategory === 'circle' ? pendingCircles
    : activeCategory === 'division' ? pendingDivisions
    : pendingSubDivisions;

  const isAllSelected = filteredOptions.length > 0 && filteredOptions.every(o => selected.includes(o));
  const isSomeSelected = filteredOptions.some(o => selected.includes(o)) && !isAllSelected;

  /* toggle a single item (cascading cleanup) */
  const toggle = (item: string) => {
    if (activeCategory === 'circle') {
      const next = pendingCircles.includes(item)
        ? pendingCircles.filter(c => c !== item)
        : [...pendingCircles, item];
      const allowedDivs = next.flatMap(c => HIERARCHY.divisions[c] ?? []);
      const nextDivs    = pendingDivisions.filter(d => allowedDivs.includes(d));
      const allowedSDs  = nextDivs.flatMap(d => HIERARCHY.subDivisions[d] ?? []);
      setPendingCircles(next);
      setPendingDivisions(nextDivs);
      setPendingSubDivisions(pendingSubDivisions.filter(sd => allowedSDs.includes(sd)));
    } else if (activeCategory === 'division') {
      const next = pendingDivisions.includes(item)
        ? pendingDivisions.filter(d => d !== item)
        : [...pendingDivisions, item];
      const allowedSDs = next.flatMap(d => HIERARCHY.subDivisions[d] ?? []);
      setPendingDivisions(next);
      setPendingSubDivisions(pendingSubDivisions.filter(sd => allowedSDs.includes(sd)));
    } else {
      setPendingSubDivisions(prev =>
        prev.includes(item) ? prev.filter(sd => sd !== item) : [...prev, item]
      );
    }
  };

  const toggleAll = () => {
    if (isAllSelected) {
      if (activeCategory === 'circle') {
        const next = pendingCircles.filter(c => !filteredOptions.includes(c));
        const allowedDivs = next.flatMap(c => HIERARCHY.divisions[c] ?? []);
        const nextDivs    = pendingDivisions.filter(d => allowedDivs.includes(d));
        setPendingCircles(next);
        setPendingDivisions(nextDivs);
        setPendingSubDivisions(pendingSubDivisions.filter(sd => nextDivs.flatMap(d => HIERARCHY.subDivisions[d] ?? []).includes(sd)));
      } else if (activeCategory === 'division') {
        const next = pendingDivisions.filter(d => !filteredOptions.includes(d));
        setPendingDivisions(next);
        setPendingSubDivisions(pendingSubDivisions.filter(sd => next.flatMap(d => HIERARCHY.subDivisions[d] ?? []).includes(sd)));
      } else {
        setPendingSubDivisions(prev => prev.filter(sd => !filteredOptions.includes(sd)));
      }
    } else {
      if (activeCategory === 'circle')
        setPendingCircles(prev => [...new Set([...prev, ...filteredOptions])]);
      else if (activeCategory === 'division')
        setPendingDivisions(prev => [...new Set([...prev, ...filteredOptions])]);
      else
        setPendingSubDivisions(prev => [...new Set([...prev, ...filteredOptions])]);
    }
  };

  const clearAll = () => {
    setPendingCircles([]);
    setPendingDivisions([]);
    setPendingSubDivisions([]);
  };

  const handleApply = () => {
    onApply({ circles: pendingCircles, divisions: pendingDivisions, subDivisions: pendingSubDivisions });
    onClose();
  };

  const totalSelected = pendingCircles.length + pendingDivisions.length + pendingSubDivisions.length;

  const categories: { key: Category; count: number }[] = [
    { key: 'circle',      count: pendingCircles.length },
    { key: 'division',    count: pendingDivisions.length },
    { key: 'subdivision', count: pendingSubDivisions.length },
  ];

  const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row', alignItems: 'center',
      paddingTop: insets.top + 12, paddingHorizontal: 16, paddingBottom: 14,
      borderBottomWidth: 1, borderBottomColor: colors.border,
      backgroundColor: colors.card,
    },
    headerTitle: { flex: 1, fontSize: 17, fontWeight: '700' as const, color: colors.foreground, fontFamily: 'Inter_700Bold', marginLeft: 12 },
    clearBtn: { paddingHorizontal: 4 },
    body: { flex: 1, flexDirection: 'row' },
    /* left panel */
    leftPanel: { width: 112, backgroundColor: colors.muted, borderRightWidth: 1, borderRightColor: colors.border },
    catItem: { paddingVertical: 16, paddingHorizontal: 12, borderLeftWidth: 3, borderLeftColor: 'transparent' },
    catItemActive: { backgroundColor: colors.background, borderLeftColor: colors.primary },
    catLabel: { fontSize: 13 },
    catBadge: { marginTop: 5, alignSelf: 'flex-start', backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 },
    catBadgeText: { fontSize: 10, color: '#fff', fontFamily: 'Inter_700Bold' },
    /* right panel */
    rightPanel: { flex: 1 },
    searchBox: {
      flexDirection: 'row', alignItems: 'center', margin: 12,
      height: 40, borderRadius: 10, borderWidth: 1, borderColor: colors.border,
      backgroundColor: colors.card, paddingHorizontal: 10, gap: 8,
    },
    searchInput: { flex: 1, fontSize: 13, color: colors.foreground, fontFamily: 'Inter_400Regular' },
    optionRow: {
      flexDirection: 'row', alignItems: 'center', paddingVertical: 13,
      paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 12,
    },
    checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    optionLabel: { fontSize: 14, flex: 1 },
    emptyHint: { padding: 24, alignItems: 'center' },
    emptyText: { fontSize: 13, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', textAlign: 'center' },
    /* footer */
    footer: {
      flexDirection: 'row', gap: 10, paddingHorizontal: 16,
      paddingTop: 12, paddingBottom: insets.bottom + 12,
      borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.card,
    },
    footerBtn: { flex: 1, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      onShow={handleShow}
    >
      <View style={s.root}>

        {/* ── Header ── */}
        <View style={s.header}>
          <Pressable onPress={onClose} hitSlop={8}>
            <X size={22} color={colors.foreground} />
          </Pressable>
          <Text style={s.headerTitle}>
            Filter{totalSelected > 0 ? ` (${totalSelected} selected)` : ''}
          </Text>
          {totalSelected > 0 && (
            <Pressable style={s.clearBtn} onPress={clearAll} hitSlop={8}>
              <Text style={{ fontSize: 13, color: colors.destructive, fontFamily: 'Inter_600SemiBold' }}>Clear All</Text>
            </Pressable>
          )}
        </View>

        {/* ── Body ── */}
        <View style={s.body}>

          {/* Left panel — category nav */}
          <View style={s.leftPanel}>
            {categories.map(({ key, count }) => (
              <Pressable
                key={key}
                style={[s.catItem, activeCategory === key && s.catItemActive]}
                onPress={() => { setActiveCategory(key); setSearch(''); }}
              >
                <Text style={[
                  s.catLabel,
                  { color: activeCategory === key ? colors.primary : colors.foreground,
                    fontFamily: activeCategory === key ? 'Inter_600SemiBold' : 'Inter_400Regular' },
                ]}>
                  {CATEGORY_LABELS[key]}
                </Text>
                {count > 0 && (
                  <View style={s.catBadge}>
                    <Text style={s.catBadgeText}>{count}</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>

          {/* Right panel — options */}
          <View style={s.rightPanel}>
            <View style={s.searchBox}>
              <Search size={14} color={colors.mutedForeground} />
              <TextInput
                style={s.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder={`Search ${CATEGORY_LABELS[activeCategory]}…`}
                placeholderTextColor={colors.mutedForeground}
              />
              {search ? (
                <Pressable onPress={() => setSearch('')} hitSlop={8}>
                  <CircleX size={16} color={colors.mutedForeground} />
                </Pressable>
              ) : null}
            </View>

            {allOptions.length === 0 ? (
              <View style={s.emptyHint}>
                <Text style={s.emptyText}>
                  {activeCategory === 'division'
                    ? 'Select a Circle first to see Divisions'
                    : activeCategory === 'subdivision'
                    ? 'Select a Division first to see Sub-Divisions'
                    : 'No options available'}
                </Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Select All row */}
                <Pressable style={s.optionRow} onPress={toggleAll}>
                  <View style={[s.checkbox, {
                    borderColor: isAllSelected ? colors.primary : colors.border,
                    backgroundColor: isAllSelected ? colors.primary : isSomeSelected ? `${colors.primary}20` : 'transparent',
                  }]}>
                    {isAllSelected
                      ? <Check size={12} color="#fff" />
                      : isSomeSelected
                      ? <View style={{ width: 8, height: 2, borderRadius: 1, backgroundColor: colors.primary }} />
                      : null}
                  </View>
                  <Text style={[s.optionLabel, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
                    Select All
                  </Text>
                </Pressable>

                {filteredOptions.length === 0 ? (
                  <View style={s.emptyHint}>
                    <Text style={s.emptyText}>No results for "{search}"</Text>
                  </View>
                ) : (
                  filteredOptions.map(opt => {
                    const checked = selected.includes(opt);
                    return (
                      <Pressable key={opt} style={s.optionRow} onPress={() => toggle(opt)}>
                        <View style={[s.checkbox, {
                          borderColor: checked ? colors.primary : colors.border,
                          backgroundColor: checked ? colors.primary : 'transparent',
                        }]}>
                          {checked && <Check size={12} color="#fff" />}
                        </View>
                        <Text style={[s.optionLabel, {
                          color: checked ? colors.primary : colors.foreground,
                          fontFamily: checked ? 'Inter_600SemiBold' : 'Inter_400Regular',
                        }]}>
                          {opt}
                        </Text>
                      </Pressable>
                    );
                  })
                )}
              </ScrollView>
            )}
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={s.footer}>
          <Pressable style={[s.footerBtn, { backgroundColor: colors.muted }]} onPress={onClose}>
            <Text style={{ color: colors.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 15 }}>Cancel</Text>
          </Pressable>
          <Pressable style={[s.footerBtn, { backgroundColor: colors.primary }]} onPress={handleApply}>
            <Text style={{ color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 15 }}>Apply Filter</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
