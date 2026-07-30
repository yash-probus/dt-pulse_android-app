import React, { useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, Pressable,
  ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/context/AppContext';
import useColors from '@/hooks/useColors';

export default function LoginScreen() {
  const colors = useColors();
  const { login } = useApp();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('engineer@kesco.in');
  const [password, setPassword] = useState('kesco123');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await new Promise((r) => setTimeout(r, 600));
    login(email || 'engineer@kesco.in');
    router.replace('/(tabs)');
  };

  const handleGoogle = () => {
    login('google.user@kesco.in');
    router.replace('/(tabs)');
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { flexGrow: 1, justifyContent: 'center' },
    inner: { paddingHorizontal: 24, paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 32), paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 32) },
    logoRow: { alignItems: 'center', marginBottom: 32 },
    logoCircle: { width: 64, height: 64, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    eyebrow: { fontSize: 11, letterSpacing: 2, fontWeight: '600' as const, color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' },
    title: { fontSize: 26, fontWeight: '700' as const, color: colors.foreground, fontFamily: 'Inter_700Bold', marginTop: 4 },
    tagline: { fontSize: 13, color: colors.mutedForeground, marginTop: 2, fontFamily: 'Inter_400Regular' },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: 24 },
    card: { backgroundColor: colors.card, borderRadius: colors.radius + 4, padding: 20, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 16, elevation: 4 },
    label: { fontSize: 12, fontWeight: '600' as const, color: colors.mutedForeground, marginBottom: 6, letterSpacing: 0.5, fontFamily: 'Inter_600SemiBold' },
    inputRow: { flexDirection: 'row' as const, alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: colors.radius, paddingHorizontal: 14, height: 48, backgroundColor: colors.background, marginBottom: 16 },
    input: { flex: 1, fontSize: 15, color: colors.foreground, fontFamily: 'Inter_400Regular' },
    btn: { height: 50, borderRadius: colors.radius, alignItems: 'center' as const, justifyContent: 'center' as const, marginBottom: 12 },
    btnPrimary: { backgroundColor: colors.primary },
    btnSecondary: { backgroundColor: colors.muted, borderWidth: 1, borderColor: colors.border },
    btnText: { fontSize: 15, fontWeight: '600' as const, fontFamily: 'Inter_600SemiBold' },
    footer: { marginTop: 20, alignItems: 'center' as const },
    footerText: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', textAlign: 'center' as const },
    poweredRow: { flexDirection: 'row' as const, alignItems: 'center', justifyContent: 'center', marginTop: 32 },
    poweredText: { fontSize: 11, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
    probusText: { fontSize: 11, fontWeight: '700' as const, color: colors.accent, fontFamily: 'Inter_700Bold' },
  });

  return (
    <View style={s.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={s.inner}>
            {/* Logo */}
            <View style={s.logoRow}>
              <View style={s.logoCircle}>
                <Ionicons name="flash" size={32} color="#FFFFFF" />
              </View>
              <Text style={s.eyebrow}>KESCO SUITE</Text>
              <Text style={s.title}>DTPulse</Text>
              <Text style={s.tagline}>Monitor. Detect. Protect.</Text>
            </View>

            <View style={s.divider} />

            {/* Card */}
            <View style={s.card}>
              <Text style={s.label}>LOGIN ID</Text>
              <View style={s.inputRow}>
                <Ionicons name="mail-outline" size={18} color={colors.mutedForeground} style={{ marginRight: 10 }} />
                <TextInput
                  style={s.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>

              <Text style={s.label}>PASSWORD</Text>
              <View style={s.inputRow}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.mutedForeground} style={{ marginRight: 10 }} />
                <TextInput
                  style={s.input}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPw}
                  placeholderTextColor={colors.mutedForeground}
                />
                <Pressable onPress={() => setShowPw(!showPw)} hitSlop={8}>
                  <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.mutedForeground} />
                </Pressable>
              </View>

              <Pressable
                style={({ pressed }) => [s.btn, s.btnPrimary, { opacity: pressed || loading ? 0.8 : 1, transform: [{ scale: loading ? 1 : 1 }] }]}
                onPress={handleSignIn}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={[s.btnText, { color: colors.primaryForeground }]}>Sign In</Text>
                )}
              </Pressable>

              <Pressable
                style={({ pressed }) => [s.btn, s.btnSecondary, { opacity: pressed ? 0.7 : 1 }]}
                onPress={handleGoogle}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="logo-google" size={18} color={colors.foreground} />
                  <Text style={[s.btnText, { color: colors.foreground }]}>Continue with Google</Text>
                </View>
              </Pressable>
            </View>

            <View style={s.footer}>
              <Text style={s.footerText}>Prototype build — any credentials are accepted.</Text>
            </View>

            <View style={s.poweredRow}>
              <Text style={s.poweredText}>Built by </Text>
              <Text style={s.probusText}>Probus Smart Things</Text>
              <Text style={s.poweredText}> for KESCO</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
