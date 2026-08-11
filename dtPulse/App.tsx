import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { navigationRef } from '@/utils/router';
import { AppProvider } from '@/context/AppContext';

// Import screens
import LoginScreen from '@/screens/login';
import DashboardScreen from '@/screens/dashboard';
import SettingsScreen from '@/screens/settings';
import ConfiguratorScreen from '@/screens/configurator';
import DTAnalyzerScreen from '@/screens/dt-analyzer';
import ProductManualScreen from '@/screens/product-manual';
import SiteSurveyScreen from '@/screens/site-survey';
import InstallationScreen from '@/screens/installation';
import ProfileScreen from '@/screens/profile';

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer ref={navigationRef}>
            <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
              <Stack.Screen name="login" component={LoginScreen} options={{ animation: 'fade' }} />
              <Stack.Screen name="dashboard" component={DashboardScreen} />
              <Stack.Screen name="settings" component={SettingsScreen} />
              <Stack.Screen name="configurator" component={ConfiguratorScreen} />
              <Stack.Screen name="configurator-device-detail" component={require('@/screens/configurator/device/[id]').default} />
              <Stack.Screen name="dt-analyzer" component={DTAnalyzerScreen} />
              <Stack.Screen name="dt-analyzer-detail" component={require('@/screens/dt-analyzer/dt/[code]').default} />
              <Stack.Screen name="product-manual" component={ProductManualScreen} />
              <Stack.Screen name="product-manual-detail" component={require('@/screens/product-manual/[slug]').default} />
              <Stack.Screen name="site-survey" component={SiteSurveyScreen} />
              <Stack.Screen name="installation" component={InstallationScreen} />
              <Stack.Screen name="profile" component={ProfileScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </QueryClientProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
