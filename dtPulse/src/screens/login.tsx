import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, Dimensions, Image, KeyboardAvoidingView,
  Platform, Pressable, ScrollView, TextInput, View, Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {  User, Lock, EyeOff, Eye, Check  } from '@/utils/icons';
import { router } from '@/utils/router';
import Haptics from 'react-native-haptic-feedback';
import { useApp } from '@/context/AppContext';
import Video from 'react-native-video';
import { ProbusLogo } from '@/components/ProbusLogo';
import { userService } from '@/services/userService';

const KESCO_LOGO   = require('@/assets/images/kesco-logo-v2.png');
const DTPULSE_VIDEO = require('@/assets/images/logo.mp4');

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
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);

  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);

  const handleForgotPassword = async () => {
    if (!loginId) {
      Alert.alert('Error', 'Please enter your LOGIN ID');
      return;
    }
    setLoading(true);
    try {
      await userService.forgotPassword(loginId);
      Alert.alert('Success', 'A password reset request has been sent to your registered email.');
      setForgotPasswordMode(false);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    if (Platform.OS !== 'web') {
      await Haptics.trigger('impactLight');
    }
    await new Promise((resolve) => setTimeout(() => resolve(undefined), 600));
    login(loginId || 'engineer@kesco.in');
    router.replace('dashboard');
  };

  // Tallest logo drives the divider height
  const logoRowH = Math.max(KESCO_H, DTP_H);

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
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
            paddingHorizontal: 44,
            justifyContent: 'space-between',
          }}>

            {/* ── Logo Stack: DTPulse -> KESCO ── */}
            <View style={{
              alignItems: 'center',
              width: '100%',
              marginBottom: 40,
              gap: 20, // Clean gap between the two logos
            }}>
              {/* DTPulse Video Logo */}
              <View style={{ height: 160, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <Video
                  source={DTPULSE_VIDEO}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="contain"
                  repeat={true}
                  muted={true}
                  playInBackground={false}
                  playWhenInactive={false}
                />
              </View>



              {/* KESCO Logo & Text */}
              <View style={{ height: 100, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <Image
                  source={KESCO_LOGO}
                  style={{ width: 260, height: '100%' }}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* ── Login form card ───────────────────────────────── */}
            <View>
              <View style={{
                backgroundColor: '#111111',
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: '#222222',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 5,
                marginBottom: 12,
              }}>
                {/* Login ID */}
                <Text style={label}>LOGIN ID</Text>
                <View style={field}>
                  <User size={18} color="#999" style={{ marginRight: 10 }} />
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

                {/* Password & Forgot Password Mode Toggle */}
                {!forgotPasswordMode ? (
                  <>
                    <Text style={label}>PASSWORD</Text>
                    <View style={field}>
                      <Lock size={18} color="#999" style={{ marginRight: 10 }} />
                      <TextInput
                        style={input}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPw}
                        placeholder="••••••••••"
                        placeholderTextColor="#BBBBBB"
                      />
                      <Pressable onPress={() => setShowPw(v => !v)} hitSlop={10}>
                        {showPw ? <EyeOff size={20} color="#999" /> : <Eye size={20} color="#999" />}
                      </Pressable>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      {/* Remember Me */}
                      <Pressable
                        onPress={() => setRememberMe(v => !v)}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
                      >
                        <View style={{
                          width: 20, height: 20, borderRadius: 4, borderWidth: 1.5,
                          borderColor: rememberMe ? '#6246ea' : '#444444',
                          backgroundColor: rememberMe ? '#6246ea' : 'transparent',
                          alignItems: 'center', justifyContent: 'center',
                        }}>
                          {rememberMe && <Check size={13} color="#FFFFFF" />}
                        </View>
                        <Text style={{ fontSize: 14, color: '#FFFFFF', fontFamily: 'Inter_400Regular' }}>
                          Remember Me
                        </Text>
                      </Pressable>
                      
                      {/* Forgot Password */}
                      <Pressable onPress={() => setForgotPasswordMode(true)}>
                        <Text style={{ fontSize: 14, color: '#6246ea', fontFamily: 'Inter_500Medium' }}>
                          Forgot Password?
                        </Text>
                      </Pressable>
                    </View>
                  </>
                ) : (
                  <Pressable onPress={() => setForgotPasswordMode(false)} style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 14, color: '#6246ea', fontFamily: 'Inter_500Medium' }}>
                      Back to Sign In
                    </Text>
                  </Pressable>
                )}

                {/* Sign In / Submit */}
                <Pressable
                  style={({ pressed }) => ({
                    height: 44, borderRadius: 10,
                    alignItems: 'center', justifyContent: 'center',
                    backgroundColor: '#4040C0',
                    opacity: pressed || loading ? 0.8 : 1,
                  })}
                  onPress={forgotPasswordMode ? handleForgotPassword : handleSignIn}
                  disabled={loading}
                >
                  {loading
                    ? <ActivityIndicator color="#FFFFFF" />
                    : <Text style={{ fontSize: 16, fontWeight: '600', fontFamily: 'Inter_600SemiBold', color: '#FFFFFF' }}>
                        {forgotPasswordMode ? 'Send Reset Request' : 'Sign In'}
                      </Text>
                  }
                </Pressable>
              </View>
            </View>

            {/* ── Footer ───────────────────────────────────────── */}
            <View style={{ alignItems: 'center', paddingTop: 8, width: '100%' }}>
              <Text style={{ fontSize: 12, color: '#999', fontFamily: 'Inter_400Regular', marginBottom: 6 }}>
                Powered by
              </Text>
              <ProbusLogo width={150} height={41} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 }}>
                <Pressable onPress={() => Alert.alert('Legal', 'Terms and conditions apply.')}>
                  <Text style={{ fontSize: 13, color: '#6246ea', fontFamily: 'Inter_500Medium' }}>Legal</Text>
                </Pressable>
                <Text style={{ fontSize: 13, color: '#C0C0C0', fontFamily: 'Inter_400Regular' }}>|</Text>
                <Pressable onPress={() => Alert.alert('Support', 'Contact: support@probussmartthings.com')}>
                  <Text style={{ fontSize: 13, color: '#6246ea', fontFamily: 'Inter_500Medium' }}>Contact & Support</Text>
                </Pressable>
              </View>
              <Text style={{ fontSize: 10, color: '#C0C0C0', fontFamily: 'Inter_400Regular', marginTop: 8 }}>
                Version 0.0.1
              </Text>
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
  color: '#666',
  fontFamily: 'Inter_700Bold',
  letterSpacing: 0.8,
  textTransform: 'uppercase' as const,
  marginBottom: 6,
};

const field = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  borderWidth: 1,
  borderColor: '#222',
  borderRadius: 10,
  paddingHorizontal: 14,
  height: 42,
  backgroundColor: '#000',
  marginBottom: 12,
};

const input = {
  flex: 1,
  fontSize: 15,
  color: '#FFFFFF',
  fontFamily: 'Inter_400Regular',
};
