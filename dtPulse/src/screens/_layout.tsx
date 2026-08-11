import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AppProvider } from '@/context/AppContext';

// The navigation tree is already wrapped in NavigationContainer in App.tsx.
// We just export a wrapper component if needed, or we don't need this file anymore.
// Since App.tsx handles NavigationContainer and Stack, we don't need this RootLayout!
// But just in case any component imports it, we can return null.
export default function RootLayout() {
  return null;
}
