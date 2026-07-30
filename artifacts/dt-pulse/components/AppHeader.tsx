import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useApp } from '@/context/AppContext';
import useColors from '@/hooks/useColors';

interface AppHeaderProps {
  title: string;
  back?: boolean;
  backTo?: string;
}

export function AppHeader({ title, back, backTo }: AppHeaderProps) {
  const colors = useColors();
  const { theme, toggleTheme } = useApp();
  const insets = useSafeAreaInsets();
  const isDark = theme === 'dark';

  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);

  const handleBack = () => {
    if (backTo) router.push(backTo as any);
    else if (router.canGoBack()) router.back();
  };

  return (
    <View style={[s.container, { paddingTop: topPad, backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.card, borderBottomColor: colors.border }]}>
      {Platform.OS === 'ios' && (
        <BlurView intensity={95} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      )}
      <View style={s.row}>
        <View style={s.left}>
          {back ? (
            <Pressable
              onPress={handleBack}
              style={({ pressed }) => [s.iconBtn, { opacity: pressed ? 0.6 : 1 }]}
              hitSlop={8}
            >
              <Ionicons name="arrow-back" size={22} color={colors.foreground} />
            </Pressable>
          ) : (
            <View style={[s.logoMark, { backgroundColor: colors.primary }]}>
              <Ionicons name="flash" size={16} color="#FFFFFF" />
            </View>
          )}
          <View style={{ marginLeft: back ? 8 : 12 }}>
            <Text style={[s.eyebrow, { color: colors.mutedForeground }]}>KESCO SUITE</Text>
            <Text style={[s.title, { color: colors.foreground }]} numberOfLines={1}>{title}</Text>
          </View>
        </View>
        <Pressable
          onPress={toggleTheme}
          style={({ pressed }) => [s.iconBtn, { opacity: pressed ? 0.6 : 1 }]}
          hitSlop={8}
        >
          <Feather name={isDark ? 'sun' : 'moon'} size={20} color={colors.foreground} />
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 56,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  logoMark: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  eyebrow: { fontSize: 10, letterSpacing: 1.5, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  title: { fontSize: 16, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
});
