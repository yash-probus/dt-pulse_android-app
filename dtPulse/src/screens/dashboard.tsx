import React, { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator, PermissionsAndroid } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {  Settings, MapPin, CloudSun, Droplets, Wind, Umbrella, Radio, Activity, BookOpen, Wrench, ChevronRight, Cloud, Sun, CloudRain  } from '@/utils/icons';
import { router } from '@/utils/router';
import LinearGradient from 'react-native-linear-gradient';
import { useApp } from '@/context/AppContext';
import useColors from '@/hooks/useColors';
import { AppHeader } from '@/components/AppHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { useQuery } from '@tanstack/react-query';
// import Geolocation from '@react-native-community/geolocation'; // Removed to prevent linking error crash

const MODULES = [
  { id: 'configurator', title: 'Configurator', desc: 'Discover BLE devices, read & configure on site.', icon: Radio, route: 'configurator', available: true },
  { id: 'dt-analyzer', title: 'DT Analyzer', desc: 'Live distribution transformer telemetry.', icon: Activity, route: 'dt-analyzer', available: true },
  { id: 'product-manual', title: 'Product Manual', desc: 'Sensor & gateway field guides.', icon: BookOpen, route: 'product-manual', available: true },
  { id: 'site-survey', title: 'Site Survey', desc: 'Site conditions, photos & GPS markers.', icon: MapPin, route: 'site-survey', available: false },
  { id: 'installation', title: 'Installation', desc: 'Guided installations & checklists.', icon: Wrench, route: 'installation', available: false },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning,';
  if (h < 17) return 'Good afternoon,';
  return 'Good evening,';
}

function getTime() {
  const d = new Date();
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'pm' : 'am';
  h = h % 12;
  h = h ? h : 12; // the hour '0' should be '12'
  const minStr = m < 10 ? '0' + m : m;
  return `${h}:${minStr} ${ampm}`;
}

const KANPUR_COORDS = { lat: 26.4499, lng: 80.3319 };

function getWeatherIcon(code: number) {
  if (code === 0) return Sun;
  if (code <= 3) return CloudSun;
  if (code >= 51 && code <= 67) return CloudRain;
  return Cloud;
}

function getWeatherCondition(code: number) {
  if (code === 0) return 'Clear sky';
  if (code === 1) return 'Mainly clear';
  if (code === 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code >= 45 && code <= 48) return 'Foggy';
  if (code >= 51 && code <= 67) return 'Rainy';
  return 'Cloudy';
}

export default function DashboardScreen() {
  const colors = useColors();
  const { user } = useApp();
  const insets = useSafeAreaInsets();
  const headerH = insets.top + (Platform.OS === 'web' ? 67 + 56 : 56);

  const [location, setLocation] = useState(KANPUR_COORDS);
  const [cityName, setCityName] = useState('Detecting...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const getLocation = () => {
    setCityName('Locating...');
    const geo = (navigator as any).geolocation;
    if (!geo) {
      setCityName('Kanpur (Default)');
      setErrorMsg('GPS not supported');
      return;
    }

    geo.getCurrentPosition(
      async (pos: any) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`);
          const data = await res.json();
          const city = data.address.city || data.address.town || data.address.village || data.address.state || 'Current Location';
          setCityName(city);
          setErrorMsg(null);
        } catch (e) {
          setCityName('Location Found');
        }
      },
      (err: any) => {
        console.log('Location error:', err);
        setCityName('Kanpur, UP');
        setErrorMsg(err.message || 'Timeout');
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 }
    );
  };

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Permission',
              message: 'DTPulse needs access to your location to show local weather.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            getLocation();
          } else {
            setCityName('Kanpur, UP');
            setErrorMsg('Permission Denied');
          }
        } catch (err) {
          console.warn(err);
        }
      } else {
        getLocation();
      }
    };

    requestLocationPermission();
  }, []);

  const { data: weather, isLoading: weatherLoading } = useQuery({
    queryKey: ['weather', location.lat, location.lng],
    queryFn: async () => {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lng}&current=temperature_2m,wind_speed_10m,weather_code&hourly=temperature_2m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
      const res = await fetch(url);
      const data = await res.json();

      // Calculate average humidity from last 24h of hourly data
      const humidity = Math.round(data.hourly.relative_humidity_2m.slice(0, 24).reduce((a: number, b: number) => a + b, 0) / 24);

      return {
        temp: Math.round(data.current.temperature_2m),
        wind: Math.round(data.current.wind_speed_10m),
        humidity,
        code: data.current.weather_code,
        tomorrowMax: Math.round(data.daily.temperature_2m_max[1]),
        tomorrowMin: Math.round(data.daily.temperature_2m_min[1]),
      };
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  const firstName = (user?.name ?? 'Engineer').split(' ')[0];

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { paddingTop: headerH + 16, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 120), paddingHorizontal: 16 },
    greetRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 },
    greetText: { fontSize: 13, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
    greetName: { fontSize: 26, fontWeight: '700' as const, color: colors.foreground, fontFamily: 'Inter_700Bold' },
    greetRole: { fontSize: 13, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 2 },
    settingsBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
    weatherCard: { borderRadius: 24, padding: 16, marginBottom: 20, overflow: 'hidden' },
    weatherHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 0 },
    weatherLocRow: { flexDirection: 'row', alignItems: 'center' },
    weatherLocText: { fontSize: 13, color: '#FFFFFF', fontFamily: 'Inter_600SemiBold', marginLeft: 4 },
    weatherDot: { color: 'rgba(255,255,255,0.4)', marginHorizontal: 6, fontSize: 12 },
    weatherTimeText: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter_400Regular' },
    weatherMainIcon: { position: 'absolute', right: -5, top: -8 },
    weatherMainRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 4 },
    weatherTempLarge: { fontSize: 56, fontWeight: '700' as const, color: '#FFFFFF', fontFamily: 'Inter_700Bold', letterSpacing: -2 },
    weatherVerticalDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 16 },
    weatherCondition: { fontSize: 14, color: '#FFFFFF', opacity: 0.9, fontFamily: 'Inter_500Medium', lineHeight: 18 },
    weatherHorizontalDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 12 },
    weatherFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    weatherStatCol: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    weatherStatVal: { fontSize: 14, fontWeight: '600' as const, color: '#FFFFFF', fontFamily: 'Inter_600SemiBold' },
    weatherStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter_400Regular' },
    weatherStatDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.15)' },
    sectionHeader: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 1.5, color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold', marginBottom: 12, textTransform: 'uppercase' as const },
    moduleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.border, gap: 14 },
    moduleIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    moduleTitle: { fontSize: 15, fontWeight: '600' as const, color: colors.foreground, fontFamily: 'Inter_600SemiBold' },
    moduleDesc: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 2, flex: 1 },
  });

  return (
    <View style={s.container}>
      <AppHeader title="Dashboard" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Greeting */}
        <View style={s.greetRow}>
          <View>
            <Text style={s.greetText}>{getGreeting()}</Text>
            <Text style={s.greetName}>{firstName}</Text>
            <Text style={s.greetRole}>{user?.designation ?? 'Field Engineer'}</Text>
          </View>
          <Pressable style={s.settingsBtn} onPress={() => router.push('settings')}>
            <Settings size={18} color={colors.foreground} />
          </Pressable>
        </View>

        {/* Weather Card */}
        <LinearGradient
          colors={['#0D2B52', '#08162E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.weatherCard}
        >
          {weatherLoading ? (
            <View style={{ height: 160, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator color="white" />
            </View>
          ) : (
            <>
              <View style={s.weatherHeader}>
                <View style={s.weatherLocRow}>
                  <MapPin size={14} color="white" />
                  <Pressable onPress={getLocation} hitSlop={10}>
                    <Text style={s.weatherLocText}>{cityName}</Text>
                    {errorMsg && (
                      <Text style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginLeft: 4 }}>
                        ({errorMsg})
                      </Text>
                    )}
                  </Pressable>
                  <Text style={s.weatherDot}>•</Text>
                  <Text style={s.weatherTimeText}>{getTime().toLowerCase()}</Text>
                </View>
                <View style={s.weatherMainIcon}>
                  {(() => {
                    const Icon = getWeatherIcon(weather?.code ?? 0);
                    return <Icon size={64} color="#FFD700" />;
                  })()}
                </View>
              </View>

              <View style={s.weatherMainRow}>
                <Text style={s.weatherTempLarge}>{weather?.temp ?? '--'}°</Text>
                <View style={s.weatherVerticalDivider} />
                <View>
                  {getWeatherCondition(weather?.code ?? 0).split(' ').map((word, i) => (
                    <Text key={i} style={s.weatherCondition}>{word}</Text>
                  ))}
                </View>
              </View>

              <View style={s.weatherHorizontalDivider} />

              <View style={s.weatherFooter}>
                <View style={s.weatherStatCol}>
                  <Droplets size={18} color="#4FC3F7" />
                  <View>
                    <Text style={s.weatherStatVal}>{weather?.humidity ?? '--'}%</Text>
                    <Text style={s.weatherStatLabel}>Humidity</Text>
                  </View>
                </View>

                <View style={s.weatherStatDivider} />

                <View style={s.weatherStatCol}>
                  <Wind size={18} color="white" />
                  <View>
                    <Text style={s.weatherStatVal}>{weather?.wind ?? '--'} km/h</Text>
                    <Text style={s.weatherStatLabel}>Wind</Text>
                  </View>
                </View>

                <View style={s.weatherStatDivider} />

                <View style={s.weatherStatCol}>
                  <Umbrella size={18} color="#81D4FA" />
                  <View>
                    <Text style={s.weatherStatVal}>Tomorrow</Text>
                    <Text style={s.weatherStatLabel}>{weather?.tomorrowMax ?? '--'}° / {weather?.tomorrowMin ?? '--'}°</Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </LinearGradient>

        {/* Modules */}
        <Text style={s.sectionHeader}>Modules</Text>
        {MODULES.map((mod) => (
          <Pressable
            key={mod.id}
            style={({ pressed }) => [s.moduleCard, { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
            onPress={() => router.push(mod.route as any)}
          >
            <View style={[s.moduleIconBox, { backgroundColor: mod.available ? `${colors.accent}18` : colors.muted }]}>
              <mod.icon size={22} color={mod.available ? colors.accent : colors.mutedForeground} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[s.moduleTitle, !mod.available && { color: colors.mutedForeground }]}>{mod.title}</Text>
                {!mod.available && <StatusBadge status="SOON" small />}
              </View>
              <Text style={s.moduleDesc} numberOfLines={1}>{mod.desc}</Text>
            </View>
            <ChevronRight size={18} color={colors.mutedForeground} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
