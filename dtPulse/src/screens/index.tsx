import { Redirect } from '@/utils/router';
import { useApp } from '@/context/AppContext';

export default function Index() {
  const { user } = useApp();
  if (user) return <Redirect href="/dashboard" />;
  return <Redirect href="/login" />;
}
