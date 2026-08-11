import { createNavigationContainerRef, CommonActions, StackActions, useRoute } from '@react-navigation/native';
import React from 'react';

export const navigationRef = createNavigationContainerRef();

export const router = {
  push: (name: string, params?: any) => {
    if (navigationRef.isReady()) {
      navigationRef.dispatch(CommonActions.navigate(name, params));
    }
  },
  replace: (name: string, params?: any) => {
    if (navigationRef.isReady()) {
      navigationRef.dispatch(StackActions.replace(name, params));
    }
  },
  back: () => {
    if (navigationRef.isReady() && navigationRef.canGoBack()) {
      navigationRef.goBack();
    }
  },
  canGoBack: () => {
    return navigationRef.isReady() && navigationRef.canGoBack();
  }
};

export function usePathname() {
  const route = useRoute();
  return route.name;
}

export function useLocalSearchParams() {
  const route = useRoute();
  return (route.params as any) || {};
}
