import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform,
  Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/context/AppContext';
import useColors from '@/hooks/useColors';

const KESCO_LOGO = require('@/assets/images/kesco-logo.png');
const DTPULSE_LOGO = require('@/assets/images/dtpulse-logo.png');
const PROBUS_LOGO = require('@/assets/images/probus-logo.png');

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

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { flexGrow: 1 },
    inner: {
      paddingHorizontal: 28,
      paddingTop: insets.top + (Platform.OS === 'web' ? 67 + 24 : 32),
      paddingBottom: insets.bottom + (Platform.OS === 'web' ? 24 : 24),
    },
    // Branding
    brandSection: { alignItems: 'center', marginBottom: 28 },
    kescoLogo: { width: 110, height: 82, borderRadius: 8 },
    dtpulseLogo: { width: 220, height: 72, borderRadius: 8, backgroundColor: '#0B2545', marginTop: 14 },
    // Form card
    card: {
      backgroundColor: colors.card, borderRadius: 16, padding: 20,
      shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1, shadowRadius: 16, elevation: 4,
    },
    label: { fontSize: 11, fontWeight: '600' as const, color: colors.mutedForeground, marginBottom: 6, letterSpacing: 0.6, fontFamily: 'Inter_600SemiBold', textTransform: 'uppercase' as const },
    inputRow: {
      flexDirection: 'row' as const, alignItems: 'center',
      borderWidth: 1, borderColor: colors.border, borderRadius: 10,
      paddingHorizontal: 14, height: 48, backgroundColor: colors.background, marginBottom: 16,
    },
    input: { flex: 1, fontSize: 15, color: colors.foreground, fontFamily: 'Inter_400Regular' },
    // Remember me
    rememberRow: { flexDirection: 'row' as const, alignItems: 'center', marginBottom: 20, gap: 10 },
    checkbox: {
      width: 20, height: 20, borderRadius: 5, borderWidth: 1.5,
      borderColor: rememberMe ? colors.accent : colors.border,
      backgroundColor: rememberMe ? colors.accent : 'transparent',
      alignItems: 'center', justifyContent: 'center',
    },
    rememberLabel: { fontSize: 14, color: colors.foreground, fontFamily: 'Inter_400Regular' },
    // Sign In
    btn: { height: 50, borderRadius: 10, alignItems: 'center' as const, justifyContent: 'center' as const, backgroundColor: colors.primary },
    btnText: { fontSize: 15, fontWeight: '600' as const, fontFamily: 'Inter_600SemiBold', color: '#FFFFFF' },
    // Footer
    footer: { alignItems: 'center' as const, marginTop: 28 },
    poweredLabel: { fontSize: 11, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginBottom: 6 },
    probusLogo: { width: 90, height: 28 },
    linksRow: { flexDirection: 'row' as const, alignItems: 'center', gap: 6, marginTop: 12 },
    linkText: { fontSize: 12, color: colors.accent, fontFamily: 'Inter_500Medium' },
    linkSep: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
    version: { fontSize: 11, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 8 },
    protoNote: { fontSize: 11, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', textAlign: 'center' as const, marginTop: 10 },
  });

  return (
    <View style={s.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.inner}>
            {/* Branding */}
            <View style={s.brandSection}>
              <Image source={KESCO_LOGO} style={s.kescoLogo} resizeMode="contain" />
              <Image source={DTPULSE_LOGO} style={s.dtpulseLogo} resizeMode="contain" />
            </View>

            {/* Form */}
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
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={s.btnText}>Sign In</Text>
                )}
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
