import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, Image, KeyboardAvoidingView,
  Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/context/AppContext';
import useColors from '@/hooks/useColors';

const KESCO_LOGO  = require('@/assets/images/kesco-logo-clean.png');
const DTPULSE_LOGO = require('@/assets/images/dtpulse-logo-clean.png');
const PROBUS_LOGO  = require('@/assets/images/probus-logo.png');

export default function LoginScreen() {
  const colors = useColors();
  const { login } = useApp();
  const insets = useSafeAreaInsets();
  const [loginId, setLoginId]       = useState('engineer@kesco.in');
  const [password, setPassword]     = useState('kesco123');
  const [loading, setLoading]       = useState(false);
  const [showPw, setShowPw]         = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);

  const handleSignIn = async () => {
    setLoading(true);
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await new Promise((r) => setTimeout(r, 600));
    login(loginId || 'engineer@kesco.in');
    router.replace('/(tabs)');
  };

  const s = StyleSheet.create({
    container:  { flex: 1, backgroundColor: '#F2F2F7' },
    scroll:     { flexGrow: 1 },
    inner: {
      flex: 1,
      paddingTop: topPad + 32,
      paddingBottom: insets.bottom + 20,
      paddingHorizontal: 24,
      justifyContent: 'space-between',
    },

    // ── Header logo row ──────────────────────────────────────────────
    logoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 32,
      // keep it compact — don't stretch to full width
    },
    // KESCO side: logo + text below, constrained width
    kescoSide: {
      alignItems: 'flex-start',
      flexShrink: 1,
    },
    kescoLogo: {
      width: 110,
      height: 110,
    },
    kescoName: {
      fontSize: 13,
      fontWeight: '700' as const,
      color: '#1A4EAD',
      fontFamily: 'Inter_700Bold',
      marginTop: 10,
      lineHeight: 18,
      // constrained to same width as logo
      width: 110,
    },
    kescoSubtitle: {
      fontSize: 10,
      fontWeight: '600' as const,
      color: '#555',
      fontFamily: 'Inter_600SemiBold',
      marginTop: 4,
      letterSpacing: 0.3,
      textTransform: 'uppercase' as const,
      width: 110,
    },

    // Vertical divider
    divider: {
      width: 1,
      height: 110,
      backgroundColor: '#D0D0D0',
      marginHorizontal: 20,
      alignSelf: 'flex-start',
      marginTop: 0,
    },

    // DTPulse side
    dtpulseSide: {
      flex: 1,
      alignItems: 'flex-start',
      justifyContent: 'center',
      alignSelf: 'flex-start',
      paddingTop: 8,
    },
    dtpulseLogo: {
      width: '100%' as any,
      height: 90,
    },

    // ── Form card ────────────────────────────────────────────────────
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
      marginBottom: 12,
    },
    label: {
      fontSize: 11,
      fontWeight: '700' as const,
      color: '#888',
      fontFamily: 'Inter_700Bold',
      letterSpacing: 0.8,
      textTransform: 'uppercase' as const,
      marginBottom: 8,
    },
    inputRow: {
      flexDirection: 'row' as const,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 10,
      paddingHorizontal: 14,
      height: 52,
      backgroundColor: '#FAFAFA',
      marginBottom: 20,
    },
    input: {
      flex: 1,
      fontSize: 15,
      color: '#2b2c34',
      fontFamily: 'Inter_400Regular',
    },
    rememberRow: {
      flexDirection: 'row' as const,
      alignItems: 'center',
      marginBottom: 20,
      gap: 10,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 1.5,
      borderColor: rememberMe ? '#6246ea' : '#C0C0C0',
      backgroundColor: rememberMe ? '#6246ea' : 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    rememberLabel: {
      fontSize: 14,
      color: '#2b2c34',
      fontFamily: 'Inter_400Regular',
    },
    btn: {
      height: 52,
      borderRadius: 10,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      backgroundColor: '#4040C0',
    },
    btnText: {
      fontSize: 16,
      fontWeight: '600' as const,
      fontFamily: 'Inter_600SemiBold',
      color: '#FFFFFF',
    },
    protoNote: {
      fontSize: 12,
      color: '#999',
      fontFamily: 'Inter_400Regular',
      textAlign: 'center' as const,
    },

    // ── Footer ───────────────────────────────────────────────────────
    footer: {
      alignItems: 'center' as const,
      paddingTop: 8,
    },
    poweredLabel: {
      fontSize: 12,
      color: '#999',
      fontFamily: 'Inter_400Regular',
      marginBottom: 6,
    },
    probusLogo: {
      width: 100,
      height: 32,
    },
    linksRow: {
      flexDirection: 'row' as const,
      alignItems: 'center',
      gap: 8,
      marginTop: 12,
    },
    linkText: {
      fontSize: 13,
      color: '#6246ea',
      fontFamily: 'Inter_500Medium',
    },
    linkSep: {
      fontSize: 13,
      color: '#C0C0C0',
      fontFamily: 'Inter_400Regular',
    },
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

            {/* ── Side-by-side logos ── */}
            <View style={s.logoRow}>
              {/* KESCO side */}
              <View style={s.kescoSide}>
                <Image source={KESCO_LOGO} style={s.kescoLogo} resizeMode="contain" />
                <Text style={s.kescoName}>Kanpur Electricity Supply Company Limited</Text>
                <Text style={s.kescoSubtitle}>A Government of U.P. Undertaking</Text>
              </View>

              {/* Vertical divider */}
              <View style={s.divider} />

              {/* DTPulse side */}
              <View style={s.dtpulseSide}>
                <Image source={DTPULSE_LOGO} style={s.dtpulseLogo} resizeMode="contain" />
              </View>
            </View>

            {/* ── Login form ── */}
            <View>
              <View style={s.card}>
                <Text style={s.label}>Login ID</Text>
                <View style={s.inputRow}>
                  <Ionicons name="person-outline" size={18} color="#999" style={{ marginRight: 10 }} />
                  <TextInput
                    style={s.input}
                    value={loginId}
                    onChangeText={setLoginId}
                    placeholder="engineer@kesco.in"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholderTextColor="#BBBBBB"
                  />
                </View>

                <Text style={s.label}>Password</Text>
                <View style={s.inputRow}>
                  <Ionicons name="lock-closed-outline" size={18} color="#999" style={{ marginRight: 10 }} />
                  <TextInput
                    style={s.input}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPw}
                    placeholder="••••••••••"
                    placeholderTextColor="#BBBBBB"
                  />
                  <Pressable onPress={() => setShowPw(!showPw)} hitSlop={10}>
                    <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color="#999" />
                  </Pressable>
                </View>

                <Pressable style={s.rememberRow} onPress={() => setRememberMe(!rememberMe)}>
                  <View style={s.checkbox}>
                    {rememberMe && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
                  </View>
                  <Text style={s.rememberLabel}>Remember Me</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [s.btn, { opacity: pressed || loading ? 0.8 : 1 }]}
                  onPress={handleSignIn}
                  disabled={loading}
                >
                  {loading
                    ? <ActivityIndicator color="#FFFFFF" />
                    : <Text style={s.btnText}>Sign In</Text>
                  }
                </Pressable>
              </View>

              <Text style={s.protoNote}>Prototype build — any credentials are accepted.</Text>
            </View>

            {/* ── Footer ── */}
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
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
