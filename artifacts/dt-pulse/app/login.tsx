import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, Dimensions, Image, KeyboardAvoidingView,
  Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/context/AppContext';
import useColors from '@/hooks/useColors';

const KESCO_BANNER  = require('@/assets/images/kesco-banner.png');
const DTPULSE_LOGO  = require('@/assets/images/dtpulse-logo-new.png');
const PROBUS_LOGO   = require('@/assets/images/probus-logo.png');

const SCREEN_W = Dimensions.get('window').width;

export default function LoginScreen() {
  const colors = useColors();
  const { login } = useApp();
  const insets = useSafeAreaInsets();
  const [loginId, setLoginId] = useState('engineer@kesco.in');
  const [password, setPassword] = useState('kesco123');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await new Promise((r) => setTimeout(r, 600));
    login(loginId || 'engineer@kesco.in');
    router.replace('/(tabs)');
  };

  // KESCO banner: original image is ~1070×714 ≈ 3:2 ratio
  const bannerH = Math.round(SCREEN_W * (714 / 1070));
  // DTPulse logo: original ~1024×683 ≈ 3:2, show at comfortable height
  const dtpulseH = Math.round(SCREEN_W * 0.34);

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { flexGrow: 1 },

    // ── Dark header block ──────────────────────────────────────────────
    header: {
      backgroundColor: colors.background,
      paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0),
      alignItems: 'center',
    },
    kescoBanner: {
      width: SCREEN_W,
      height: bannerH,
    },
    dtpulseWrap: {
      width: SCREEN_W,
      height: dtpulseH + 16,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
    },
    dtpulseLogo: {
      width: SCREEN_W * 0.70,
      height: dtpulseH,
    },

    // ── Form section ───────────────────────────────────────────────────
    body: {
      paddingHorizontal: 24,
      paddingTop: 28,
      paddingBottom: insets.bottom + (Platform.OS === 'web' ? 24 : 24),
    },
    card: {
      backgroundColor: colors.card, borderRadius: 16, padding: 20,
      shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1, shadowRadius: 16, elevation: 4,
    },
    label: {
      fontSize: 11, fontWeight: '600' as const, color: colors.mutedForeground,
      marginBottom: 6, letterSpacing: 0.6, fontFamily: 'Inter_600SemiBold',
      textTransform: 'uppercase' as const,
    },
    inputRow: {
      flexDirection: 'row' as const, alignItems: 'center',
      borderWidth: 1, borderColor: colors.border, borderRadius: 10,
      paddingHorizontal: 14, height: 48, backgroundColor: colors.background, marginBottom: 16,
    },
    input: { flex: 1, fontSize: 15, color: colors.foreground, fontFamily: 'Inter_400Regular' },
    rememberRow: { flexDirection: 'row' as const, alignItems: 'center', marginBottom: 20, gap: 10 },
    checkbox: {
      width: 20, height: 20, borderRadius: 5, borderWidth: 1.5,
      borderColor: rememberMe ? colors.accent : colors.border,
      backgroundColor: rememberMe ? colors.accent : 'transparent',
      alignItems: 'center', justifyContent: 'center',
    },
    rememberLabel: { fontSize: 14, color: colors.foreground, fontFamily: 'Inter_400Regular' },
    btn: {
      height: 50, borderRadius: 10,
      alignItems: 'center' as const, justifyContent: 'center' as const,
      backgroundColor: colors.primary,
    },
    btnText: { fontSize: 15, fontWeight: '600' as const, fontFamily: 'Inter_600SemiBold', color: '#FFFFFF' },

    // ── Footer ─────────────────────────────────────────────────────────
    protoNote: {
      fontSize: 11, color: colors.mutedForeground, fontFamily: 'Inter_400Regular',
      textAlign: 'center' as const, marginTop: 12,
    },
    footer: { alignItems: 'center' as const, marginTop: 24 },
    poweredLabel: { fontSize: 11, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginBottom: 6 },
    probusLogo: { width: 90, height: 28 },
    linksRow: { flexDirection: 'row' as const, alignItems: 'center', gap: 6, marginTop: 12 },
    linkText: { fontSize: 12, color: colors.accent, fontFamily: 'Inter_500Medium' },
    linkSep: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
    version: { fontSize: 11, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 8 },
  });

  return (
    <View style={s.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Dark branding header ── */}
          <View style={s.header}>
            {/* KESCO banner — edge to edge */}
            <Image source={KESCO_BANNER} style={s.kescoBanner} resizeMode="cover" />
            {/* DTPulse product logo */}
            <View style={s.dtpulseWrap}>
              <Image source={DTPULSE_LOGO} style={s.dtpulseLogo} resizeMode="contain" />
            </View>
          </View>

          {/* ── Form ── */}
          <View style={s.body}>
            <View style={s.card}>
              <Text style={s.label}>Login ID</Text>
              <View style={s.inputRow}>
                <Ionicons name="person-outline" size={18} color={colors.mutedForeground} style={{ marginRight: 10 }} />
                <TextInput
                  style={s.input}
                  value={loginId}
                  onChangeText={setLoginId}
                  placeholder="Login ID"
                  autoCapitalize="none"
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>

              <Text style={s.label}>Password</Text>
              <View style={s.inputRow}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.mutedForeground} style={{ marginRight: 10 }} />
                <TextInput
                  style={s.input}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPw}
                  placeholder="Password"
                  placeholderTextColor={colors.mutedForeground}
                />
                <Pressable onPress={() => setShowPw(!showPw)} hitSlop={8}>
                  <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.mutedForeground} />
                </Pressable>
              </View>

              {/* Remember Me */}
              <Pressable style={s.rememberRow} onPress={() => setRememberMe(!rememberMe)}>
                <View style={s.checkbox}>
                  {rememberMe && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
                </View>
                <Text style={s.rememberLabel}>Remember Me</Text>
              </Pressable>

              {/* Sign In */}
              <Pressable
                style={({ pressed }) => [s.btn, { opacity: pressed || loading ? 0.8 : 1 }]}
                onPress={handleSignIn}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={s.btnText}>Sign In</Text>}
              </Pressable>
            </View>

            <Text style={s.protoNote}>Prototype build — any credentials are accepted.</Text>

            {/* Footer */}
            <View style={s.footer}>
              <Text style={s.poweredLabel}>Powered by</Text>
              <Image source={PROBUS_LOGO} style={s.probusLogo} resizeMode="contain" />
              <View style={s.linksRow}>
                <Pressable onPress={() => Alert.alert('Legal', 'Terms and conditions apply.')}>
                  <Text style={s.linkText}>Legal</Text>
                </Pressable>
                <Text style={s.linkSep}>|</Text>
                <Pressable onPress={() => Alert.alert('Support', 'Contact: support@probussmartthings.com')}>
                  <Text style={s.linkText}>Contact & Support</Text>
                </Pressable>
              </View>
              <Text style={s.version}>Version 1.1</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
