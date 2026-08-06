import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, Dimensions, Image, KeyboardAvoidingView,
  Platform, Pressable, ScrollView, TextInput, View, Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/context/AppContext';

const KESCO_LOGO   = require('@/assets/images/kesco-logo-official.jpeg');
const DTPULSE_LOGO = require('@/assets/images/dtpulse-logo-official.jpeg');
const PROBUS_LOGO  = require('@/assets/images/probus-logo.png');

const SCREEN_W  = Dimensions.get('window').width;
const CONTENT_W = SCREEN_W - 48;           // minus 2×24 h-padding
const HALF_W    = Math.floor(CONTENT_W / 2) - 8; // each side minus half-gap

// kesco-logo-official.jpeg: the official branding image already contains
// "Kanpur Electricity Supply Company Limited" text — NO separate Text nodes needed.
// Its native aspect ratio is approximately 1 : 0.55 (landscape).
const KESCO_W = HALF_W;
const KESCO_H = Math.round(HALF_W * 0.55);

// dtpulse-logo-official.jpeg native aspect ratio ≈ 2.1 : 1 (landscape).
const DTP_W = HALF_W;
const DTP_H = Math.round(HALF_W / 2.1);

export default function LoginScreen() {
  const { login } = useApp();
  const insets    = useSafeAreaInsets();

  const [loginId,    setLoginId]    = useState('engineer@kesco.in');
  const [password,   setPassword]   = useState('kesco123');
  const [loading,    setLoading]    = useState(false);
  const [showPw,     setShowPw]     = useState(false);
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

  // Tallest logo drives the divider height
  const logoRowH = Math.max(KESCO_H, DTP_H);

  return (
    <View style={{ flex: 1, backgroundColor: '#F2F2F7' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{
            flex: 1,
            paddingTop: topPad + 32,
            paddingBottom: insets.bottom + 20,
            paddingHorizontal: 24,
            justifyContent: 'space-between',
          }}>

            {/* ── Logo row: KESCO | divider | DTPulse ───────────── */}
            {/*
              Each side is a View with explicit pixel width so text inside
              can NEVER escape its column on Expo Web.
              The official KESCO image already contains the company name text
              so we intentionally omit any <Text> node here.
            */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              height: logoRowH,
              marginBottom: 32,
              width: CONTENT_W,
            }}>
              {/* KESCO — left half */}
              <View style={{
                width: HALF_W,
                height: logoRowH,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Image
                  source={KESCO_LOGO}
                  style={{ width: KESCO_W, height: KESCO_H }}
                  resizeMode="contain"
                />
              </View>

              {/* Vertical divider */}
              <View style={{
                width: 1,
                height: logoRowH * 0.85,
                backgroundColor: '#D0D0D0',
                marginHorizontal: 8,
              }} />

              {/* DTPulse — right half */}
              <View style={{
                width: HALF_W,
                height: logoRowH,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Image
                  source={DTPULSE_LOGO}
                  style={{ width: DTP_W, height: DTP_H }}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* ── Login form card ───────────────────────────────── */}
            <View>
              <View style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                padding: 24,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 3,
                marginBottom: 12,
              }}>
                {/* Login ID */}
                <Text style={label}>LOGIN ID</Text>
                <View style={field}>
                  <Ionicons name="person-outline" size={18} color="#999" style={{ marginRight: 10 }} />
                  <TextInput
                    style={input}
                    value={loginId}
                    onChangeText={setLoginId}
                    placeholder="engineer@kesco.in"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholderTextColor="#BBBBBB"
                  />
                </View>

                {/* Password */}
                <Text style={label}>PASSWORD</Text>
                <View style={field}>
                  <Ionicons name="lock-closed-outline" size={18} color="#999" style={{ marginRight: 10 }} />
                  <TextInput
                    style={input}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPw}
                    placeholder="••••••••••"
                    placeholderTextColor="#BBBBBB"
                  />
                  <Pressable onPress={() => setShowPw(v => !v)} hitSlop={10}>
                    <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color="#999" />
                  </Pressable>
                </View>

                {/* Remember Me */}
                <Pressable
                  onPress={() => setRememberMe(v => !v)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 }}
                >
                  <View style={{
                    width: 20, height: 20, borderRadius: 4, borderWidth: 1.5,
                    borderColor: rememberMe ? '#6246ea' : '#C0C0C0',
                    backgroundColor: rememberMe ? '#6246ea' : 'transparent',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    {rememberMe && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
                  </View>
                  <Text style={{ fontSize: 14, color: '#2b2c34', fontFamily: 'Inter_400Regular' }}>
                    Remember Me
                  </Text>
                </Pressable>

                {/* Sign In */}
                <Pressable
                  style={({ pressed }) => ({
                    height: 52, borderRadius: 10,
                    alignItems: 'center', justifyContent: 'center',
                    backgroundColor: '#4040C0',
                    opacity: pressed || loading ? 0.8 : 1,
                  })}
                  onPress={handleSignIn}
                  disabled={loading}
                >
                  {loading
                    ? <ActivityIndicator color="#FFFFFF" />
                    : <Text style={{ fontSize: 16, fontWeight: '600', fontFamily: 'Inter_600SemiBold', color: '#FFFFFF' }}>
                        Sign In
                      </Text>
                  }
                </Pressable>
              </View>

              <Text style={{ fontSize: 12, color: '#999', fontFamily: 'Inter_400Regular', textAlign: 'center' }}>
                Prototype build — any credentials are accepted.
              </Text>
            </View>

            {/* ── Footer ───────────────────────────────────────── */}
            <View style={{ alignItems: 'center', paddingTop: 8 }}>
              <Text style={{ fontSize: 12, color: '#999', fontFamily: 'Inter_400Regular', marginBottom: 6 }}>
                Powered by
              </Text>
              <Image source={PROBUS_LOGO} style={{ width: 100, height: 32 }} resizeMode="contain" />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 }}>
                <Pressable onPress={() => Alert.alert('Legal', 'Terms and conditions apply.')}>
                  <Text style={{ fontSize: 13, color: '#6246ea', fontFamily: 'Inter_500Medium' }}>Legal</Text>
                </Pressable>
                <Text style={{ fontSize: 13, color: '#C0C0C0', fontFamily: 'Inter_400Regular' }}>|</Text>
                <Pressable onPress={() => Alert.alert('Support', 'Contact: support@probussmartthings.com')}>
                  <Text style={{ fontSize: 13, color: '#6246ea', fontFamily: 'Inter_500Medium' }}>Contact & Support</Text>
                </Pressable>
              </View>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ── Module-level style objects (stable references) ──────────────────────────
const label = {
  fontSize: 11,
  fontWeight: '700' as const,
  color: '#888',
  fontFamily: 'Inter_700Bold',
  letterSpacing: 0.8,
  textTransform: 'uppercase' as const,
  marginBottom: 8,
};

const field = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  borderWidth: 1,
  borderColor: '#E0E0E0',
  borderRadius: 10,
  paddingHorizontal: 14,
  height: 52,
  backgroundColor: '#FAFAFA',
  marginBottom: 20,
};

const input = {
  flex: 1,
  fontSize: 15,
  color: '#2b2c34',
  fontFamily: 'Inter_400Regular',
};
