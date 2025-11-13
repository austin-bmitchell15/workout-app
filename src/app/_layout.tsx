import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { SessionProvider, useSession } from '@/providers/session-provider';
import { View, Text } from 'react-native';

function RootLayoutNav() {
  const { session, isLoading } = useSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (session && inAuthGroup) {
      router.replace('/');
    } else if (!session && !inAuthGroup) {
      router.replace('/login');
    }
  }, [session, isLoading, segments, router]);

  if (isLoading) {
    // You can return a loading indicator here
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <SessionProvider>
      <RootLayoutNav />
    </SessionProvider>
  );
}
