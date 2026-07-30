import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Svg, Polyline } from 'react-native-svg';
import useColors from '@/hooks/useColors';
import { AppHeader } from '@/components/AppHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { DT_LIST, DT_DETAILS, LUG_CHART_DATA, OIL_TEMP_CHART_DATA, OIL_LEVEL_CHART_DATA, LUG_TABLE, OIL_TEMP_TABLE, OIL_LEVEL_TABLE } from '@/lib/mockDT';

function SnapTile({ label, value, icon, colors, danger, warning }: any) {
  return (
    <View style={{ flex: 1, backgroundColor: danger ? colors.destructiveBg : warning ? colors.warningBg : colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 12, alignItems: 'center' }}>
      <Feather name={icon} size={16} color={danger ? colors.destructive : warning ? colors.warning : colors.accent} style={{ marginBottom: 4 }} />
      <Text style={{ fontSize: 22, fontWeight: '700' as const, color: danger ? colors.destructive : warning ? colors.warning : colors.foreground, fontFamily: 'Inter_700Bold' }}>{value}</Text>
      <Text style={{ fontSize: 10, color: colors.mutedForeground, fontFamily: 'Inter_500Medium', textAlign: 'center', marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function LineChart({ data, colors: c, height = 140 }: { data: { time: string; value: number }[]; colors: any; height?: number }) {
  const width = 300;
  const pad = 24;
  const vals = data.map((d) => d.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const points = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = height - pad - ((d.value - min) / range) * (height - pad * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Polyline points={points} fill="none" stroke={c.accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: width - pad * 2 }}>
        <Text style={{ fontSize: 10, color: c.mutedForeground, fontFamily: 'Inter_400Regular' }}>{data[0].time}</Text>
        <Text style={{ fontSize: 10, color: c.mutedForeground, fontFamily: 'Inter_400Regular' }}>{data[Math.floor(data.length / 2)].time}</Text>
        <Text style={{ fontSize: 10, color: c.mutedForeground, fontFamily: 'Inter_400Regular' }}>{data[data.length - 1].time}</Text>
      </View>
    </View>
  );
}

function MultiLineChart({ series, colors: c, height = 140 }: { series: { data: { time: string; value: number }[]; color: string }[]; colors: any; height?: number }) {
  const width = 300;
  const pad = 24;
  const allVals = series.flatMap((s) => s.data.map((d) => d.value));
  const min = Math.min(...allVals);
  const max = Math.max(...allVals);
  const range = max - min || 1;
  const len = series[0].data.length;

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {series.map((s, si) => {
          const pts = s.data.map((d, i) => {
            const x = pad + (i / (len - 1)) * (width - pad * 2);
            const y = height - pad - ((d.value - min) / range) * (height - pad * 2);
            return `${x},${y}`;
          }).join(' ');
          return <Polyline key={si} points={pts} fill="none" stroke={s.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />;
        })}
      </Svg>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: width - pad * 2 }}>
        <Text style={{ fontSize: 10, color: c.mutedForeground, fontFamily: 'Inter_400Regular' }}>{series[0].data[0].time}</Text>
        <Text style={{ fontSize: 10, color: c.mutedForeground, fontFamily: 'Inter_400Regular' }}>{series[0].data[Math.floor(len / 2)].time}</Text>
        <Text style={{ fontSize: 10, color: c.mutedForeground, fontFamily: 'Inter_400Regular' }}>{series[0].data[len - 1].time}</Text>
      </View>
    </View>
  );
}

function OilLevelBar({ data, colors: c }: { data: { time: string; value: number }[]; colors: any }) {
  return (
    <View>
      <View style={{ flexDirection: 'row', gap: 2, alignItems: 'flex-end', height: 60 }}>
        {data.slice(0, 12).map((d, i) => (
          <View key={i} style={{ flex: 1, height: Math.max(4, (d.value / 100) * 60), backgroundColor: d.value < 30 ? c.destructive : d.value < 50 ? c.warning : c.chartBar1, borderRadius: 2 }} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
        <Text style={{ fontSize: 10, color: c.mutedForeground, fontFamily: 'Inter_400Regular' }}>00:00</Text>
        <Text style={{ fontSize: 10, color: c.mutedForeground, fontFamily: 'Inter_400Regular' }}>12:00</Text>
        <Text style={{ fontSize: 10, color: c.mutedForeground, fontFamily: 'Inter_400Regular' }}>23:00</Text>
      </View>
    </View>
  );
}

type ViewType = 'graph' | 'table';

function SectionToggle({ title, view, setView, onExport, colors }: { title: string; view: ViewType; setView: (v: ViewType) => void; onExport?: () => void; colors: any }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 }}>
      <Text style={{ fontSize: 12, fontWeight: '700' as const, color: colors.foreground, fontFamily: 'Inter_700Bold', textTransform: 'uppercase' as const, letterSpacing: 1, flex: 1 }}>{title}</Text>
      <View style={{ flexDirection: 'row', borderRadius: 8, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
        {(['graph', 'table'] as const).map((v) => (
          <Pressable
            key={v}
            style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: view === v ? colors.primary : colors.card }}
            onPress={() => setView(v)}
          >
            <Text style={{ fontSize: 12, color: view === v ? '#FFFFFF' : colors.foreground, fontFamily: 'Inter_500Medium' }}>{v.charAt(0).toUpperCase() + v.slice(1)}</Text>
          </Pressable>
        ))}
      </View>
      <Feather name="download" size={16} color={colors.mutedForeground} />
    </View>
  );
}

function TableView({ columns, rows, colors }: { columns: string[]; rows: Record<string, string>[]; colors: any }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator>
      <View>
        <View style={{ flexDirection: 'row', backgroundColor: colors.muted, borderRadius: 8, marginBottom: 4 }}>
          {columns.map((col) => (
            <View key={col} style={{ width: 120, padding: 8 }}>
              <Text style={{ fontSize: 10, fontWeight: '700' as const, color: colors.foreground, fontFamily: 'Inter_700Bold', textTransform: 'uppercase' as const }}>{col}</Text>
            </View>
          ))}
        </View>
        {rows.map((row, i) => (
          <View key={i} style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border }}>
            {columns.map((col) => {
              const key = col.toLowerCase().replace(/\s+/g, '');
              const val = row[Object.keys(row).find((k) => k.toLowerCase().replace(/\s+/g, '') === key) ?? ''] ?? '—';
              return (
                <View key={col} style={{ width: 120, padding: 8 }}>
                  <Text style={{ fontSize: 11, color: colors.foreground, fontFamily: 'Inter_400Regular' }}>{val}</Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export default function DTInfoScreen() {
  const colors = useColors();
  const { code } = useLocalSearchParams<{ code: string }>();
  const insets = useSafeAreaInsets();
  const headerH = insets.top + (Platform.OS === 'web' ? 67 + 56 : 56);

  const dt = DT_LIST.find((d) => d.code === code) ?? DT_LIST[0];
  const details = DT_DETAILS[code ?? ''] ?? {};

  const [genInfoOpen, setGenInfoOpen] = useState(false);
  const [lugView, setLugView] = useState<ViewType>('graph');
  const [oilTempView, setOilTempView] = useState<ViewType>('graph');
  const [oilLevelView, setOilLevelView] = useState<ViewType>('graph');

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { paddingTop: headerH + 12, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 80), paddingHorizontal: 16 },
    backRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
    backText: { fontSize: 13, color: colors.accent, fontFamily: 'Inter_500Medium' },
    headerCard: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 16 },
    dtCode: { fontSize: 22, fontWeight: '700' as const, color: colors.foreground, fontFamily: 'Inter_700Bold' },
    dtMeta: { fontSize: 13, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 4 },
    gpsText: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 6 },
    section: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 16 },
    snapRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
    genInfoRow: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
    genInfoLabel: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_500Medium', width: 140 },
    genInfoValue: { fontSize: 12, color: colors.foreground, fontFamily: 'Inter_400Regular', flex: 1 },
  });

  const lugTableCols = ['Device ID', 'Sensor Type', 'Server Time', 'Firmware', 'Analog', 'Battery', 'RSSI', 'Error'];
  const oilTableCols = ['Device ID', 'Sensor Type', 'Server Time', 'Firmware', 'Analog', 'Battery', 'RSSI', 'Error'];
  const oilLvlTableCols = ['Device ID', 'Sensor Type', 'Battery', 'Digital', 'Oil Level Status', 'RSSI', 'Error'];

  return (
    <View style={s.container}>
      <AppHeader title="DT Analyzer" back />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Back button */}
        <Pressable style={s.backRow} onPress={() => router.back()}>
          <Feather name="arrow-left" size={14} color={colors.accent} />
          <Text style={s.backText}>Back to DT List</Text>
        </Pressable>

        {/* Header Card */}
        <View style={s.headerCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Text style={s.dtCode}>{dt.code}</Text>
            <StatusBadge status={dt.status} />
          </View>
          <Text style={s.dtMeta}>{dt.subDivision} · {dt.kva}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
            <Feather name="map-pin" size={12} color={colors.mutedForeground} />
            <Text style={s.gpsText}>{dt.lat}, {dt.lng}</Text>
          </View>
        </View>

        {/* General Information Accordion */}
        <View style={s.section}>
          <Pressable style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => setGenInfoOpen(!genInfoOpen)}>
            <Text style={{ fontSize: 12, fontWeight: '700' as const, color: colors.foreground, fontFamily: 'Inter_700Bold', textTransform: 'uppercase' as const, letterSpacing: 1, flex: 1 }}>General Information</Text>
            <Feather name={genInfoOpen ? 'chevron-up' : 'chevron-down'} size={16} color={colors.mutedForeground} />
          </Pressable>
          {genInfoOpen && (
            <View style={{ marginTop: 12 }}>
              {Object.entries(details).length > 0 ? (
                Object.entries(details).map(([k, v]) => (
                  <View key={k} style={s.genInfoRow}>
                    <Text style={s.genInfoLabel}>{k}</Text>
                    <Text style={s.genInfoValue}>{v || '—'}</Text>
                  </View>
                ))
              ) : (
                [['DT Code', dt.code], ['Circle', dt.circle], ['Division', dt.division], ['Sub-Division', dt.subDivision], ['Substation', dt.substation], ['Rating', dt.kva], ['DT Type', dt.dtType], ['Gateway', dt.gateway], ['Latitude', dt.lat], ['Longitude', dt.lng]].map(([k, v]) => (
                  <View key={k} style={s.genInfoRow}>
                    <Text style={s.genInfoLabel}>{k}</Text>
                    <Text style={s.genInfoValue}>{v}</Text>
                  </View>
                ))
              )}
            </View>
          )}
        </View>

        {/* Latest Snapshot */}
        <View style={s.section}>
          <Text style={{ fontSize: 12, fontWeight: '700' as const, color: colors.foreground, fontFamily: 'Inter_700Bold', textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 12 }}>Latest Snapshot</Text>
          <View style={s.snapRow}>
            <SnapTile label="Lug R" value={dt.lugR} icon="thermometer" colors={colors} danger={dt.lugRAlert} />
            <SnapTile label="Lug Y" value={dt.lugY} icon="thermometer" colors={colors} />
            <SnapTile label="Lug B" value={dt.lugB} icon="thermometer" colors={colors} />
          </View>
          <View style={s.snapRow}>
            <SnapTile label="Lug N" value={dt.lugN} icon="thermometer" colors={colors} />
            <SnapTile label="Oil Level" value={dt.oilLevel} icon="droplet" colors={colors} warning={dt.oilLevel === 'Low'} />
            <SnapTile label="Oil Temp" value={dt.oilTemp} icon="activity" colors={colors} />
          </View>
        </View>

        {/* Lug Temperature */}
        <View style={s.section}>
          <SectionToggle title="Lug Temperature" view={lugView} setView={setLugView} colors={colors} />
          {lugView === 'graph' ? (
            <>
              <MultiLineChart
                series={[
                  { data: LUG_CHART_DATA.R, color: colors.chartLine1 },
                  { data: LUG_CHART_DATA.Y, color: colors.chartLine2 },
                  { data: LUG_CHART_DATA.B, color: colors.chartLine3 },
                ]}
                colors={colors}
              />
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                {[{ c: colors.chartLine1, l: 'R' }, { c: colors.chartLine2, l: 'Y' }, { c: colors.chartLine3, l: 'B' }].map((item) => (
                  <View key={item.l} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: item.c }} />
                    <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }}>Lug {item.l}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <TableView
              columns={lugTableCols}
              rows={LUG_TABLE.map((r) => ({
                'Device ID': r.deviceId, 'Sensor Type': r.sensorType, 'Server Time': r.serverTime,
                'Firmware': r.firmware, 'Analog': r.analog, 'Battery': r.battery + 'V', 'RSSI': r.rssi, 'Error': r.error,
              }))}
              colors={colors}
            />
          )}
        </View>

        {/* Oil Temperature */}
        <View style={s.section}>
          <SectionToggle title="Oil Temperature" view={oilTempView} setView={setOilTempView} colors={colors} />
          {oilTempView === 'graph' ? (
            <LineChart data={OIL_TEMP_CHART_DATA} colors={colors} />
          ) : (
            <TableView
              columns={oilTableCols}
              rows={OIL_TEMP_TABLE.map((r) => ({
                'Device ID': r.deviceId, 'Sensor Type': r.sensorType, 'Server Time': r.serverTime,
                'Firmware': r.firmware, 'Analog': r.analog, 'Battery': r.battery + 'V', 'RSSI': r.rssi, 'Error': r.error,
              }))}
              colors={colors}
            />
          )}
        </View>

        {/* Oil Level */}
        <View style={s.section}>
          <SectionToggle title="Oil Level" view={oilLevelView} setView={setOilLevelView} colors={colors} />
          {oilLevelView === 'graph' ? (
            <OilLevelBar data={OIL_LEVEL_CHART_DATA} colors={colors} />
          ) : (
            <TableView
              columns={oilLvlTableCols}
              rows={OIL_LEVEL_TABLE.map((r) => ({
                'Device ID': r.deviceId, 'Sensor Type': r.sensorType, 'Battery': r.battery + 'V',
                'Digital': r.digital, 'Oil Level Status': r.oilLevelStatus, 'RSSI': r.rssi, 'Error': r.error,
              }))}
              colors={colors}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
