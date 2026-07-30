import React, { useRef, useState } from 'react';
import { Animated, PanResponder, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Svg, Circle } from 'react-native-svg';
import useColors from '@/hooks/useColors';
import { DT_ALARMS, type DtAlarm } from '@/lib/mockDT';

function HealthRing({ critical, warning, colors }: { critical: number; warning: number; colors: any }) {
  const total = critical + warning;
  const size = 100;
  const strokeWidth = 12;
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const critFrac = total > 0 ? critical / total : 0;
  const warnFrac = total > 0 ? warning / total : 0;
  const critDash = critFrac * circ;
  const warnDash = warnFrac * circ;
  const critOffset = 0;
  const warnOffset = -(critDash);

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.border} strokeWidth={strokeWidth} fill="none" />
        {critFrac > 0 && (
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.destructive} strokeWidth={strokeWidth} fill="none"
            strokeDasharray={`${critDash} ${circ - critDash}`}
            strokeDashoffset={circ / 4}
            strokeLinecap="round"
          />
        )}
        {warnFrac > 0 && (
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.warning} strokeWidth={strokeWidth} fill="none"
            strokeDasharray={`${warnDash} ${circ - warnDash}`}
            strokeDashoffset={circ / 4 - critDash}
            strokeLinecap="round"
          />
        )}
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: '700' as const, color: colors.foreground, fontFamily: 'Inter_700Bold' }}>{total}</Text>
        <Text style={{ fontSize: 10, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }}>Active</Text>
      </View>
    </View>
  );
}

function SwipeableAlertCard({ alarm, onAck, colors }: { alarm: DtAlarm; onAck: () => void; colors: any }) {
  const pan = useRef(new Animated.ValueXY()).current;
  const swipeThreshold = -80;

  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 10 && Math.abs(gs.dy) < Math.abs(gs.dx),
    onPanResponderMove: (_, gs) => {
      if (gs.dx <= 0) pan.setValue({ x: Math.max(gs.dx, -120), y: 0 });
    },
    onPanResponderRelease: (_, gs) => {
      if (gs.dx < swipeThreshold) {
        Animated.spring(pan, { toValue: { x: -120, y: 0 }, useNativeDriver: false }).start();
      } else {
        Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      }
    },
  })).current;

  const borderColor = alarm.type === 'critical' ? colors.destructive : alarm.type === 'warning' ? colors.warning : colors.border;

  return (
    <View style={{ marginBottom: 10, overflow: 'hidden', borderRadius: 14 }}>
      {/* Ack button behind */}
      <View style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 120, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center', borderRadius: 14 }}>
        <Pressable onPress={onAck} style={{ alignItems: 'center', gap: 4 }}>
          <Feather name="check" size={22} color="#FFFFFF" />
          <Text style={{ fontSize: 12, color: '#FFFFFF', fontFamily: 'Inter_600SemiBold' }}>Acknowledge</Text>
        </Pressable>
      </View>
      <Animated.View style={[{ transform: [{ translateX: pan.x }] }]} {...panResponder.panHandlers}>
        <Pressable
          onPress={() => router.push(`/dt-analyzer/dt/${alarm.dtCode}` as any)}
          style={{ backgroundColor: colors.card, borderRadius: 14, borderWidth: 1.5, borderColor, padding: 14 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 }}>
            <Feather
              name={alarm.type === 'critical' ? 'alert-circle' : 'alert-triangle'}
              size={16}
              color={alarm.type === 'critical' ? colors.destructive : colors.warning}
            />
            <Text style={{ fontSize: 14, fontWeight: '700' as const, color: colors.foreground, fontFamily: 'Inter_700Bold', flex: 1 }}>{alarm.title}</Text>
            {alarm.assignedToMe && (
              <View style={{ backgroundColor: `${colors.primary}15`, borderRadius: 100, paddingHorizontal: 6, paddingVertical: 2 }}>
                <Text style={{ fontSize: 9, color: colors.primary, fontFamily: 'Inter_700Bold' }}>MINE</Text>
              </View>
            )}
          </View>
          <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginBottom: 4 }}>{alarm.dtCode} · {alarm.subDivision}</Text>
          <Text style={{ fontSize: 13, color: colors.foreground, fontFamily: 'Inter_400Regular' }}>{alarm.description}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }}>{alarm.timestamp}</Text>
            <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }}>← swipe to ack</Text>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

export default function AlertsTab({ paddingTop }: { paddingTop: number }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning'>('all');
  const [mineOnly, setMineOnly] = useState(false);
  const [acknowledged, setAcknowledged] = useState<Record<string, boolean>>({});

  const activeAlarms = DT_ALARMS.filter((a) => a.active && !acknowledged[a.id]);
  const critical = activeAlarms.filter((a) => a.type === 'critical').length;
  const warning = activeAlarms.filter((a) => a.type === 'warning').length;

  const visible = activeAlarms.filter((a) => {
    const matchFilter = filter === 'all' || a.type === filter;
    const matchMine = !mineOnly || a.assignedToMe;
    return matchFilter && matchMine;
  });

  const resolved = DT_ALARMS.filter((a) => acknowledged[a.id]);

  const s = StyleSheet.create({
    scroll: { paddingTop: paddingTop + 12, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 80), paddingHorizontal: 16 },
    healthCard: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 16 },
    healthInfo: { flex: 1 },
    healthTitle: { fontSize: 14, fontWeight: '700' as const, color: colors.foreground, fontFamily: 'Inter_700Bold' },
    healthSub: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 2 },
    tallRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
    tally: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    tallyNum: { fontSize: 18, fontWeight: '700' as const, fontFamily: 'Inter_700Bold' },
    tallyLabel: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
    filterRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, borderWidth: 1 },
    pillText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
    mineRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    mineText: { fontSize: 13, color: colors.foreground, fontFamily: 'Inter_500Medium' },
    sectionTitle: { fontSize: 11, fontWeight: '700' as const, color: colors.mutedForeground, fontFamily: 'Inter_700Bold', textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 10 },
    emptyBox: { alignItems: 'center', padding: 32, gap: 8 },
    emptyText: { fontSize: 14, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', textAlign: 'center' as const },
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Health Summary */}
      <View style={s.healthCard}>
        <HealthRing critical={critical} warning={warning} colors={colors} />
        <View style={s.healthInfo}>
          <Text style={s.healthTitle}>System Health Summary</Text>
          <Text style={s.healthSub}>Your Sub-Division Zone</Text>
          <View style={s.tallRow}>
            <View style={s.tally}>
              <Text style={[s.tallyNum, { color: colors.destructive }]}>{critical}</Text>
              <Text style={s.tallyLabel}>Critical</Text>
            </View>
            <View style={s.tally}>
              <Text style={[s.tallyNum, { color: colors.warning }]}>{warning}</Text>
              <Text style={s.tallyLabel}>Warning</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Filter Pills */}
      <View style={s.filterRow}>
        {(['all', 'critical', 'warning'] as const).map((f) => {
          const count = f === 'all' ? activeAlarms.length : f === 'critical' ? critical : warning;
          const isActive = filter === f;
          const activeColor = f === 'critical' ? colors.destructive : f === 'warning' ? colors.warning : colors.primary;
          return (
            <Pressable
              key={f}
              style={[s.pill, { borderColor: isActive ? activeColor : colors.border, backgroundColor: isActive ? `${activeColor}15` : colors.card }]}
              onPress={() => setFilter(f)}
            >
              <Text style={[s.pillText, { color: isActive ? activeColor : colors.mutedForeground }]}>
                {f.charAt(0).toUpperCase() + f.slice(1)} ({count})
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Mine only */}
      <Pressable style={s.mineRow} onPress={() => setMineOnly(!mineOnly)}>
        <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: mineOnly ? colors.primary : colors.border, backgroundColor: mineOnly ? colors.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
          {mineOnly && <Feather name="check" size={12} color="#FFFFFF" />}
        </View>
        <Text style={s.mineText}>Show only my assigned DTs</Text>
      </Pressable>

      <Text style={s.sectionTitle}>Live Alerts ({visible.length})</Text>
      {visible.length === 0 ? (
        <View style={s.emptyBox}>
          <Feather name="check-circle" size={32} color={colors.success} />
          <Text style={s.emptyText}>No active alerts in your zone.</Text>
        </View>
      ) : (
        visible.map((alarm) => (
          <SwipeableAlertCard
            key={alarm.id}
            alarm={alarm}
            onAck={() => setAcknowledged((prev) => ({ ...prev, [alarm.id]: true }))}
            colors={colors}
          />
        ))
      )}

      {resolved.length > 0 && (
        <>
          <Text style={[s.sectionTitle, { marginTop: 8 }]}>Resolved ({resolved.length})</Text>
          {resolved.map((alarm) => (
            <View key={alarm.id} style={{ backgroundColor: colors.muted, borderRadius: 14, padding: 14, marginBottom: 8, opacity: 0.7 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Feather name="check-circle" size={16} color={colors.success} />
                <Text style={{ fontSize: 14, fontWeight: '600' as const, color: colors.foreground, fontFamily: 'Inter_600SemiBold', flex: 1 }}>{alarm.title}</Text>
              </View>
              <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 4 }}>{alarm.dtCode} · Acknowledged</Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}
