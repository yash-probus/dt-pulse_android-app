import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useApp } from '@/context/AppContext';
import useColors from '@/hooks/useColors';
import { AppHeader } from '@/components/AppHeader';

function SettingRow({ icon, label, desc, value, onChange, colors }: any) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 14 }}>
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${colors.accent}18`, alignItems: 'center', justifyContent: 'center' }}>
        <Feather name={icon} size={18} color={colors.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '600' as const, color: colors.foreground, fontFamily: 'Inter_600SemiBold' }}>{label}</Text>
        <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 1 }}>{desc}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: colors.accent }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const { blePermission, setBlePermission, theme, toggleTheme, syncLogs, logout } = useApp();
  const insets = useSafeAreaInsets();
  const headerH = insets.top + (Platform.OS === 'web' ? 67 + 56 : 56);
  const [autoSync, setAutoSync] = React.useState(true);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { paddingTop: headerH + 16, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 80), paddingHorizontal: 16 },
    section: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, marginBottom: 16 },
    sectionLabel: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 1.5, color: colors.mutedForeground, fontFamily: 'Inter_700Bold', textTransform: 'uppercase' as const, paddingTop: 14, paddingBottom: 4 },
    syncBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderTopWidth: 1, borderTopColor: colors.border, gap: 14 },
    syncBtnText: { fontSize: 14, fontWeight: '600' as const, color: colors.primary, fontFamily: 'Inter_600SemiBold', flex: 1 },
    versionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 14 },
    versionText: { fontSize: 14, color: colors.foreground, fontFamily: 'Inter_500Medium', flex: 1 },
    versionValue: { fontSize: 13, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
    logoutBtn: { backgroundColor: colors.destructiveBg, borderRadius: 12, borderWidth: 1, borderColor: colors.destructive + '40', padding: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
    logoutText: { fontSize: 15, fontWeight: '600' as const, color: colors.destructive, fontFamily: 'Inter_600SemiBold' },
  });

  return (
    <View style={s.container}>
      <AppHeader title="Settings" back />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <View style={s.section}>
          <Text style={s.sectionLabel}>Permissions</Text>
          <SettingRow icon="bluetooth" label="BLE Permission" desc="Allow scanning nearby devices" value={blePermission} onChange={setBlePermission} colors={colors} />
        </View>

        <View style={s.section}>
          <Text style={s.sectionLabel}>Appearance</Text>
          <SettingRow icon="moon" label="Dark Theme" desc="Switch between light & dark mode" value={theme === 'dark'} onChange={toggleTheme} colors={colors} />
        </View>

        <View style={s.section}>
          <Text style={s.sectionLabel}>Sync</Text>
          <SettingRow icon="refresh-cw" label="Sync Settings" desc="Auto-sync logs when online" value={autoSync} onChange={setAutoSync} colors={colors} />
          <Pressable style={({ pressed }) => [s.syncBtn, { opacity: pressed ? 0.7 : 1 }]} onPress={() => syncLogs()}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${colors.primary}18`, alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="upload-cloud" size={18} color={colors.primary} />
            </View>
            <Text style={s.syncBtnText}>Run Sync Now</Text>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </Pressable>
        </View>

        <View style={s.section}>
          <View style={s.versionRow}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${colors.accent}18`, alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="info" size={18} color={colors.accent} />
            </View>
            <Text style={s.versionText}>App Version</Text>
            <Text style={s.versionValue}>DT Pulse By Probus v0.1.0</Text>
          </View>
        </View>

        <Pressable style={({ pressed }) => [s.logoutBtn, { opacity: pressed ? 0.8 : 1 }]} onPress={handleLogout}>
          <Feather name="log-out" size={18} color={colors.destructive} />
          <Text style={s.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
