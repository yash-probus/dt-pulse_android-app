import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { BlurView } from 'expo-blur';
import Svg, { Path } from 'react-native-svg';
import { useApp } from '@/context/AppContext';
import useColors from '@/hooks/useColors';

interface AppHeaderProps {
  title: string;
  back?: boolean;
  backTo?: string;
}

export function AppHeader({ title, back, backTo }: AppHeaderProps) {
  const colors = useColors();
  const { theme } = useApp();
  const insets = useSafeAreaInsets();
  const isDark = theme === 'dark';
  const pathname = usePathname();

  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);

  const handleBack = () => {
    if (backTo) router.push(backTo as any);
    else if (router.canGoBack()) router.back();
  };

  const isOnProfile = pathname === '/profile' || pathname === '/(tabs)/profile';

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
            <View style={s.logoMark}>
              <Svg viewBox="0 0 194.02 198.13" width={24} height={24}>
                <Path fill="#098040" fillRule="evenodd" d="M69.96,151.01C40.63,125.04,0,78.54,0,67.23,2.93,54.66,62.42,24.5,89.65,15.28,116.46,6.07,178.88-3.15,186.42,1.04c11.73,7.54,7.54,70.38,2.93,93.84-5.03,27.23-25.97,100.96-38.12,103.05-15.5,2.93-58.65-26.81-81.27-46.92h0Z" />
              </Svg>
            </View>
          )}
          <View style={{ marginLeft: back ? 8 : 12 }}>
            <Text style={[s.eyebrow, { color: colors.mutedForeground }]}>DT PULSE BY PROBUS</Text>
            <Text style={[s.title, { color: colors.foreground }]} numberOfLines={1}>{title}</Text>
          </View>
        </View>

        {/* Profile icon — hidden when already on Profile screen */}
        {!isOnProfile && (
          <Pressable
            onPress={() => router.push('/(tabs)/profile' as any)}
            style={({ pressed }) => [s.iconBtn, { opacity: pressed ? 0.6 : 1 }]}
            hitSlop={8}
          >
            <Feather name="user" size={20} color={colors.foreground} />
          </Pressable>
        )}
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
