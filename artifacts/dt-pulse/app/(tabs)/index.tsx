import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/context/AppContext';
import useColors from '@/hooks/useColors';
import { AppHeader } from '@/components/AppHeader';
import { StatusBadge } from '@/components/StatusBadge';

const MODULES = [
  { id: 'configurator', title: 'Configurator', desc: 'Discover BLE devices, read & configure on site.', icon: 'radio', route: '/configurator', available: true },
  { id: 'dt-analyzer', title: 'DT Analyzer', desc: 'Live distribution transformer telemetry.', icon: 'activity', route: '/dt-analyzer', available: true },
  { id: 'product-manual', title: 'Product Manual', desc: 'Sensor & gateway field guides.', icon: 'book-open', route: '/product-manual', available: true },
  { id: 'site-survey', title: 'Site Survey', desc: 'Site conditions, photos & GPS markers.', icon: 'map-pin', route: '/site-survey', available: false },
  { id: 'installation', title: 'Installation', desc: 'Guided installations & checklists.', icon: 'tool', route: '/installation', available: false },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning,';
  if (h < 17) return 'Good afternoon,';
  return 'Good evening,';
}

function getTime() {
  const d = new Date();
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'pm' : 'am';
  h = h % 12;
  h = h ? h : 12; // the hour '0' should be '12'
  const minStr = m < 10 ? '0' + m : m;
  return `${h}:${minStr} ${ampm}`;
}

export default function DashboardScreen() {
  const colors = useColors();
  const { user } = useApp();
  const insets = useSafeAreaInsets();
  const headerH = insets.top + (Platform.OS === 'web' ? 67 + 56 : 56);

  const firstName = (user?.name ?? 'Engineer').split(' ')[0];

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { paddingTop: headerH + 16, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 120), paddingHorizontal: 16 },
    greetRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 },
    greetText: { fontSize: 13, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
    greetName: { fontSize: 26, fontWeight: '700' as const, color: colors.foreground, fontFamily: 'Inter_700Bold' },
    greetRole: { fontSize: 13, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 2 },
    settingsBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
    weatherCard: { borderRadius: 24, padding: 16, marginBottom: 20, overflow: 'hidden' },
    weatherHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 0 },
    weatherLocRow: { flexDirection: 'row', alignItems: 'center' },
    weatherLocText: { fontSize: 13, color: '#FFFFFF', fontFamily: 'Inter_600SemiBold', marginLeft: 4 },
    weatherDot: { color: 'rgba(255,255,255,0.4)', marginHorizontal: 6, fontSize: 12 },
    weatherTimeText: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter_400Regular' },
    weatherMainIcon: { position: 'absolute', right: -5, top: -8 },
    weatherMainRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 4 },
    weatherTempLarge: { fontSize: 56, fontWeight: '700' as const, color: '#FFFFFF', fontFamily: 'Inter_700Bold', letterSpacing: -2 },
    weatherVerticalDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 16 },
    weatherCondition: { fontSize: 14, color: '#FFFFFF', opacity: 0.9, fontFamily: 'Inter_500Medium', lineHeight: 18 },
    weatherHorizontalDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 12 },
    weatherFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    weatherStatCol: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    weatherStatVal: { fontSize: 14, fontWeight: '600' as const, color: '#FFFFFF', fontFamily: 'Inter_600SemiBold' },
    weatherStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter_400Regular' },
    weatherStatDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.15)' },
    sectionHeader: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 1.5, color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold', marginBottom: 12, textTransform: 'uppercase' as const },
    moduleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.border, gap: 14 },
    moduleIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    moduleTitle: { fontSize: 15, fontWeight: '600' as const, color: colors.foreground, fontFamily: 'Inter_600SemiBold' },
    moduleDesc: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 2, flex: 1 },
  });

  return (
    <View style={s.container}>
      <AppHeader title="Dashboard" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Greeting */}
        <View style={s.greetRow}>
          <View>
            <Text style={s.greetText}>{getGreeting()}</Text>
            <Text style={s.greetName}>{firstName}</Text>
            <Text style={s.greetRole}>{user?.designation ?? 'Field Engineer'}</Text>
          </View>
          <Pressable style={s.settingsBtn} onPress={() => router.push('/settings')}>
            <Feather name="settings" size={18} color={colors.foreground} />
          </Pressable>
        </View>

        {/* Weather Card */}
        <LinearGradient
          colors={['#0D2B52', '#08162E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.weatherCard}
        >
          <View style={s.weatherHeader}>
            <View style={s.weatherLocRow}>
              <Ionicons name="location-sharp" size={14} color="white" />
              <Text style={s.weatherLocText}>Kanpur, UP</Text>
              <Text style={s.weatherDot}>•</Text>
              <Text style={s.weatherTimeText}>{getTime().toLowerCase()}</Text>
            </View>
            <View style={s.weatherMainIcon}>
              <Ionicons name="partly-sunny" size={64} color="#FFD700" />
            </View>
          </View>

          <View style={s.weatherMainRow}>
            <Text style={s.weatherTempLarge}>32°</Text>
            <View style={s.weatherVerticalDivider} />
            <View>
              <Text style={s.weatherCondition}>Partly</Text>
              <Text style={s.weatherCondition}>cloudy</Text>
            </View>
          </View>

          <View style={s.weatherHorizontalDivider} />

          <View style={s.weatherFooter}>
            <View style={s.weatherStatCol}>
              <Ionicons name="water" size={18} color="#4FC3F7" />
              <View>
                <Text style={s.weatherStatVal}>62%</Text>
                <Text style={s.weatherStatLabel}>Humidity</Text>
              </View>
            </View>

            <View style={s.weatherStatDivider} />

            <View style={s.weatherStatCol}>
              <Feather name="wind" size={18} color="white" />
              <View>
                <Text style={s.weatherStatVal}>12 km/h</Text>
                <Text style={s.weatherStatLabel}>Wind</Text>
              </View>
            </View>

            <View style={s.weatherStatDivider} />

            <View style={s.weatherStatCol}>
              <Ionicons name="umbrella" size={18} color="#81D4FA" />
              <View>
                <Text style={s.weatherStatVal}>Tomorrow</Text>
                <Text style={s.weatherStatLabel}>29° / 24°</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Modules */}
        <Text style={s.sectionHeader}>Modules</Text>
        {MODULES.map((mod) => (
          <Pressable
            key={mod.id}
            style={({ pressed }) => [s.moduleCard, { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
            onPress={() => router.push(mod.route as any)}
          >
            <View style={[s.moduleIconBox, { backgroundColor: mod.available ? `${colors.accent}18` : colors.muted }]}>
              <Feather name={mod.icon as any} size={22} color={mod.available ? colors.accent : colors.mutedForeground} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[s.moduleTitle, !mod.available && { color: colors.mutedForeground }]}>{mod.title}</Text>
                {!mod.available && <StatusBadge status="SOON" small />}
              </View>
              <Text style={s.moduleDesc} numberOfLines={1}>{mod.desc}</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
