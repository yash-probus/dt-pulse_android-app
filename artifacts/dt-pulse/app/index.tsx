import { Redirect } from 'expo-router';
import { useApp } from '@/context/AppContext';

export default function Index() {
  const { user } = useApp();
  if (user) return <Redirect href="/(tabs)" />;
  return <Redirect href="/login" />;
}
