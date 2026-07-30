import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import useColors from '@/hooks/useColors';
import { AppHeader } from '@/components/AppHeader';
import { MANUAL_PRODUCTS, type ManualProduct } from '@/lib/mockManual';

function iconForProduct(icon: string, color: string) {
  const map: Record<string, any> = {
    zap: 'zap', droplet: 'droplet', thermometer: 'thermometer',
    sun: 'sun', 'cloud-rain': 'cloud-rain', wifi: 'wifi',
  };
  return <Feather name={map[icon] ?? 'file-text'} size={22} color={color} />;
}

export default function ProductManualScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const headerH = insets.top + (Platform.OS === 'web' ? 67 + 56 : 56);
  const [search, setSearch] = useState('');

  const q = search.toLowerCase();
  const filtered = MANUAL_PRODUCTS.filter((p) =>
    !q || [p.name, p.shortName, p.tagline, p.categoryLabel].some((v) => v.toLowerCase().includes(q))
  );

  const sensors = filtered.filter((p) => p.category === 'sensor');
  const communication = filtered.filter((p) => p.category === 'communication');

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { paddingTop: headerH + 12, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 80), paddingHorizontal: 16 },
    searchBox: { flexDirection: 'row', alignItems: 'center', height: 46, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, paddingHorizontal: 14, gap: 10, marginBottom: 20 },
    searchInput: { flex: 1, fontSize: 14, color: colors.foreground, fontFamily: 'Inter_400Regular' },
    groupLabel: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 1.5, color: colors.mutedForeground, fontFamily: 'Inter_700Bold', textTransform: 'uppercase' as const, marginBottom: 10 },
    card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 14, marginBottom: 8, gap: 14 },
    iconBox: { width: 42, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    name: { fontSize: 15, fontWeight: '600' as const, color: colors.foreground, fontFamily: 'Inter_600SemiBold' },
    tagline: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 2 },
    emptyBox: { alignItems: 'center', padding: 40, gap: 8 },
    emptyText: { fontSize: 14, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
  });

  function Group({ title, items }: { title: string; items: ManualProduct[] }) {
    if (items.length === 0) return null;
    return (
      <>
        <Text style={s.groupLabel}>{title}</Text>
        {items.map((p) => (
          <Pressable
            key={p.slug}
            style={({ pressed }) => [s.card, { opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
            onPress={() => router.push(`/product-manual/${p.slug}` as any)}
          >
            <View style={[s.iconBox, { backgroundColor: `${p.accent}18` }]}>
              {iconForProduct(p.icon, p.accent)}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{p.shortName}</Text>
              <Text style={s.tagline} numberOfLines={2}>{p.tagline}</Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </Pressable>
        ))}
      </>
    );
  }

  return (
    <View style={s.container}>
      <AppHeader title="Product Manual" back />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <View style={s.searchBox}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={s.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search sensors, gateway, troubleshooting…"
            placeholderTextColor={colors.mutedForeground}
          />
          {search ? <Pressable onPress={() => setSearch('')}><Feather name="x" size={16} color={colors.mutedForeground} /></Pressable> : null}
        </View>

        {filtered.length === 0 ? (
          <View style={s.emptyBox}>
            <Feather name="search" size={32} color={colors.mutedForeground} />
            <Text style={s.emptyText}>No manuals match "{search}"</Text>
          </View>
        ) : (
          <>
            <Group title="Sensors" items={sensors} />
            {sensors.length > 0 && communication.length > 0 && <View style={{ height: 16 }} />}
            <Group title="Communication" items={communication} />
          </>
        )}
      </ScrollView>
    </View>
  );
}
