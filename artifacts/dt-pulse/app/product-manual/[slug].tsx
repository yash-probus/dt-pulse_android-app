import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import useColors from '@/hooks/useColors';
import { AppHeader } from '@/components/AppHeader';
import { findManual } from '@/lib/mockManual';

export default function ManualDetailScreen() {
  const colors = useColors();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  const headerH = insets.top + (Platform.OS === 'web' ? 67 + 56 : 56);
  const [openSection, setOpenSection] = useState<number | null>(0);

  const manual = findManual(slug ?? '');

  if (!manual) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <AppHeader title="Manual" back />
        <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }}>Manual not found.</Text>
      </View>
    );
  }

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { paddingTop: headerH + 12, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 80), paddingHorizontal: 16 },
    headerCard: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 20, marginBottom: 16, alignItems: 'center' },
    iconBox: { width: 60, height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    productName: { fontSize: 20, fontWeight: '700' as const, color: colors.foreground, fontFamily: 'Inter_700Bold', textAlign: 'center' as const },
    category: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 4 },
    tagline: { fontSize: 13, color: colors.foreground, fontFamily: 'Inter_400Regular', textAlign: 'center' as const, marginTop: 8, lineHeight: 20 },
    notice: { backgroundColor: colors.warningBg, borderRadius: 10, padding: 12, flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginBottom: 16 },
    noticeText: { fontSize: 12, color: colors.warning, fontFamily: 'Inter_400Regular', flex: 1, lineHeight: 18 },
    sectionCard: { backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 8, overflow: 'hidden' },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
    sectionTitle: { fontSize: 14, fontWeight: '600' as const, color: colors.foreground, fontFamily: 'Inter_600SemiBold', flex: 1 },
    sectionBody: { padding: 14, paddingTop: 0, borderTopWidth: 1, borderTopColor: colors.border },
    bodyText: { fontSize: 13, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  });

  return (
    <View style={s.container}>
      <AppHeader title={manual.shortName} back />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <View style={s.headerCard}>
          <View style={[s.iconBox, { backgroundColor: `${manual.accent}18` }]}>
            <Feather name={({ zap: 'zap', droplet: 'droplet', thermometer: 'thermometer', sun: 'sun', 'cloud-rain': 'cloud-rain', wifi: 'wifi' } as any)[manual.icon] ?? 'file-text'} size={28} color={manual.accent} />
          </View>
          <Text style={s.productName}>{manual.name}</Text>
          <Text style={s.category}>{manual.categoryLabel}</Text>
          <Text style={s.tagline}>{manual.tagline}</Text>
        </View>

        <View style={s.notice}>
          <Feather name="info" size={14} color={colors.warning} />
          <Text style={s.noticeText}>Structured manual template. Approved KESCO engineering content will be published here.</Text>
        </View>

        {manual.sections.map((section, i) => (
          <View key={i} style={s.sectionCard}>
            <Pressable style={s.sectionHeader} onPress={() => setOpenSection(openSection === i ? null : i)}>
              <Text style={s.sectionTitle}>{section.heading}</Text>
              <Feather name={openSection === i ? 'chevron-up' : 'chevron-down'} size={16} color={colors.mutedForeground} />
            </Pressable>
            {openSection === i && (
              <View style={s.sectionBody}>
                <Text style={s.bodyText}>{section.body}</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
