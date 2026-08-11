import React, { useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {  Lock, ChevronRight, Settings, LogOut, X, EyeOff, Eye  } from '@/utils/icons';
import { router } from '@/utils/router';
import Haptics from 'react-native-haptic-feedback';
import { useApp } from '@/context/AppContext';
import useColors from '@/hooks/useColors';
import { AppHeader } from '@/components/AppHeader';

function InfoRow({ label, value, colors }: { label: string; value?: string; colors: any }) {
  return (
    <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: 'Inter_500Medium', letterSpacing: 0.3, textTransform: 'uppercase' as const, marginBottom: 2 }}>{label}</Text>
      <Text style={{ fontSize: 14, color: colors.foreground, fontFamily: 'Inter_400Regular' }}>{value ?? '—'}</Text>
    </View>
  );
}

function InfoSection({ title, children, colors }: { title: string; children: React.ReactNode; colors: any }) {
  return (
    <View style={{ backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 16 }}>
      <Text style={{ fontSize: 11, fontWeight: '700' as const, letterSpacing: 1.5, color: colors.mutedForeground, fontFamily: 'Inter_700Bold', textTransform: 'uppercase' as const, marginBottom: 4 }}>{title}</Text>
      {children}
    </View>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const { user, logout, changePassword } = useApp();
  const insets = useSafeAreaInsets();
  const headerH = insets.top + (Platform.OS === 'web' ? 67 + 56 : 56);

  const [pwModal, setPwModal] = useState(false);
  const [pwStep, setPwStep] = useState<'verify' | 'set' | 'done'>('verify');
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const initials = (user?.name ?? 'FE').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  const handleLogout = () => {
    logout();
    router.replace('login');
  };

  const openPwModal = () => {
    setPwStep('verify');
    setOldPw(''); setNewPw(''); setConfirmPw(''); setPwError('');
    setPwModal(true);
  };

  const handleVerify = () => {
    const res = changePassword(oldPw, oldPw); // verify by re-setting same
    if (!res.ok && res.reason === 'incorrect_old_password') {
      setPwError('Incorrect current password');
    } else {
      setPwStep('set');
      setPwError('');
    }
  };

  const handleSetPassword = async () => {
    if (newPw.length < 6) { setPwError('Password must be at least 6 characters'); return; }
    if (newPw !== confirmPw) { setPwError('Passwords do not match'); return; }
    const res = changePassword(oldPw, newPw);
    if (!res.ok) { setPwError('Unable to update password'); return; }
    setPwStep('done');
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => { setPwModal(false); setPwStep('verify'); }, 1200);
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { paddingTop: headerH + 16, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 48 : 150), paddingHorizontal: 16 },
    avatarCard: { backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 20, alignItems: 'center', marginBottom: 16 },
    avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    avatarText: { fontSize: 26, fontWeight: '700' as const, color: '#FFFFFF', fontFamily: 'Inter_700Bold' },
    userName: { fontSize: 20, fontWeight: '700' as const, color: colors.foreground, fontFamily: 'Inter_700Bold' },
    userRole: { fontSize: 13, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 4 },
    roleBadge: { backgroundColor: `${colors.accent}18`, borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4, marginTop: 8 },
    roleBadgeText: { fontSize: 12, fontWeight: '600' as const, color: colors.accent, fontFamily: 'Inter_600SemiBold' },
    actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 12 },
    actionText: { fontSize: 15, color: colors.foreground, fontFamily: 'Inter_500Medium', flex: 1 },
    logoutBtn: { backgroundColor: colors.destructiveBg, borderRadius: 12, borderWidth: 1, borderColor: colors.destructive + '40', padding: 16, alignItems: 'center', marginTop: 8, flexDirection: 'row', justifyContent: 'center', gap: 8 },
    logoutText: { fontSize: 15, fontWeight: '600' as const, color: colors.destructive, fontFamily: 'Inter_600SemiBold' },
    modal: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay },
    modalCard: { backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: insets.bottom + 24 },
    modalTitle: { fontSize: 18, fontWeight: '700' as const, color: colors.foreground, fontFamily: 'Inter_700Bold', marginBottom: 4 },
    modalSubtitle: { fontSize: 13, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginBottom: 20 },
    inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 14, height: 48, backgroundColor: colors.background, marginBottom: 12 },
    input: { flex: 1, fontSize: 15, color: colors.foreground, fontFamily: 'Inter_400Regular' },
    errorText: { fontSize: 13, color: colors.destructive, fontFamily: 'Inter_400Regular', marginBottom: 12 },
    modalBtn: { height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, marginTop: 4 },
    modalBtnText: { fontSize: 15, fontWeight: '600' as const, color: '#FFFFFF', fontFamily: 'Inter_600SemiBold' },
    successText: { fontSize: 18, fontWeight: '700' as const, color: colors.success, fontFamily: 'Inter_700Bold', textAlign: 'center', paddingVertical: 24 },
  });

  return (
    <View style={s.container}>
      <AppHeader title="Profile" back />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Avatar */}
        <View style={s.avatarCard}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initials}</Text>
          </View>
          <Text style={s.userName}>{user?.name ?? 'Engineer'}</Text>
          <Text style={s.userRole}>{user?.designation ?? 'Field Engineer'}</Text>
          <View style={s.roleBadge}>
            <Text style={s.roleBadgeText}>{user?.role ?? 'Engineer'}</Text>
          </View>
        </View>

        <InfoSection title="Basic Information" colors={colors}>
          <InfoRow label="Name" value={user?.name} colors={colors} />
          <InfoRow label="Employee ID" value={user?.employeeId} colors={colors} />
          <InfoRow label="Role" value={user?.role} colors={colors} />
          <InfoRow label="Designation" value={user?.designation} colors={colors} />
        </InfoSection>

        <InfoSection title="Organization" colors={colors}>
          <InfoRow label="Reporting Manager" value={user?.reportingTo} colors={colors} />
          <InfoRow label="Department" value={user?.department} colors={colors} />
          <InfoRow label="Circle" value={user?.circle} colors={colors} />
          <InfoRow label="Status" value={user?.status} colors={colors} />
          <InfoRow label="Expiry Date" value={user?.expiryDate} colors={colors} />
        </InfoSection>

        <InfoSection title="Contact Information" colors={colors}>
          <InfoRow label="Email" value={user?.email} colors={colors} />
          <InfoRow label="Phone" value={user?.phone} colors={colors} />
        </InfoSection>

        <InfoSection title="Account Information" colors={colors}>
          <InfoRow label="User ID" value={user?.userId} colors={colors} />
          <InfoRow label="Joined On" value={user?.joinedOn} colors={colors} />
          <InfoRow label="Last Login" value={user?.lastLogin} colors={colors} />
          <InfoRow label="Last Password Reset" value={user?.lastPasswordReset} colors={colors} />
          <InfoRow label="Last Updated" value={user?.lastUpdated} colors={colors} />
        </InfoSection>

        {/* Actions */}
        <View style={{ backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, marginBottom: 16 }}>
          <Pressable style={s.actionRow} onPress={openPwModal}>
            <Lock size={18} color={colors.foreground} />
            <Text style={s.actionText}>Change Password</Text>
            <ChevronRight size={16} color={colors.mutedForeground} />
          </Pressable>
          <Pressable style={[s.actionRow, { borderBottomWidth: 0 }]} onPress={() => router.push('settings')}>
            <Settings size={18} color={colors.foreground} />
            <Text style={s.actionText}>Settings</Text>
            <ChevronRight size={16} color={colors.mutedForeground} />
          </Pressable>
        </View>

        <Pressable style={({ pressed }) => [s.logoutBtn, { opacity: pressed ? 0.8 : 1 }]} onPress={handleLogout}>
          <LogOut size={18} color={colors.destructive} />
          <Text style={s.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>

      {/* Change Password Modal */}
      <Modal visible={pwModal} transparent animationType="slide" onRequestClose={() => setPwModal(false)}>
        <Pressable style={s.modal} onPress={() => setPwModal(false)}>
          <Pressable style={s.modalCard} onPress={() => {}}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={s.modalTitle}>Change Password</Text>
              <Pressable onPress={() => setPwModal(false)} hitSlop={12}>
                <X size={22} color={colors.foreground} />
              </Pressable>
            </View>

            {pwStep === 'done' ? (
              <Text style={s.successText}>Password updated</Text>
            ) : pwStep === 'verify' ? (
              <>
                <Text style={s.modalSubtitle}>Enter your current password to continue.</Text>
                <View style={s.inputRow}>
                  <TextInput style={s.input} value={oldPw} onChangeText={setOldPw} secureTextEntry={!showOld} placeholder="Current password" placeholderTextColor={colors.mutedForeground} />
                  <Pressable onPress={() => setShowOld(!showOld)} hitSlop={8}>
                    {showOld ? <EyeOff size={18} color={colors.mutedForeground} /> : <Eye size={18} color={colors.mutedForeground} />}
                  </Pressable>
                </View>
                {pwError ? <Text style={s.errorText}>{pwError}</Text> : null}
                <Pressable style={[s.modalBtn, { opacity: oldPw ? 1 : 0.5 }]} onPress={handleVerify} disabled={!oldPw}>
                  <Text style={s.modalBtnText}>Continue</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={s.modalSubtitle}>Set your new password (min 6 characters).</Text>
                <View style={s.inputRow}>
                  <TextInput style={s.input} value={newPw} onChangeText={setNewPw} secureTextEntry={!showNew} placeholder="New password" placeholderTextColor={colors.mutedForeground} />
                  <Pressable onPress={() => setShowNew(!showNew)} hitSlop={8}>
                    {showNew ? <EyeOff size={18} color={colors.mutedForeground} /> : <Eye size={18} color={colors.mutedForeground} />}
                  </Pressable>
                </View>
                <View style={s.inputRow}>
                  <TextInput style={s.input} value={confirmPw} onChangeText={setConfirmPw} secureTextEntry placeholder="Confirm new password" placeholderTextColor={colors.mutedForeground} />
                </View>
                {pwError ? <Text style={s.errorText}>{pwError}</Text> : null}
                <Pressable style={[s.modalBtn, { opacity: (newPw && confirmPw) ? 1 : 0.5 }]} onPress={handleSetPassword} disabled={!newPw || !confirmPw}>
                  <Text style={s.modalBtnText}>Update Password</Text>
                </Pressable>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
