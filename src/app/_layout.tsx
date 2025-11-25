import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  useRouter,
  Slot,
  useSegments,
  useRootNavigationState,
} from 'expo-router';
import { Session } from '@supabase/supabase-js';
import { View, ActivityIndicator } from 'react-native';
import { Profile } from '../components/types';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import {
  signOut,
  getInitialSession,
  onAuthStateChange,
  getUserProfile,
} from '@/services/AuthService';

interface AuthContextType {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  setProfile: (profile: Profile | null) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  profile: null,
  loading: true,
  setProfile: () => {},
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const segments = useSegments();
  const rootNavigationState = useRootNavigationState();

  const loadProfile = async (userId: string) => {
    const { data, error } = await getUserProfile(userId);
    if (error) {
      console.error('Error fetching profile:', error);
    }
    if (data) {
      setProfile(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    const initSession = async () => {
      const initialSession = await getInitialSession();
      setSession(initialSession);
      if (initialSession) {
        await loadProfile(initialSession.user.id);
      } else {
        setLoading(false);
      }
    };

    initSession();

    // 2. Listen for auth changes
    const subscription = onAuthStateChange(async newSession => {
      setSession(newSession);
      if (newSession) {
        await loadProfile(newSession.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // --- NAVIGATION PROTECTION LOGIC ---
  useEffect(() => {
    if (loading) return;

    if (!rootNavigationState?.key) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/(app)');
    }
  }, [session, loading, segments, router, rootNavigationState?.key]);

  const handleSignOut = async () => {
    await signOut();
    setSession(null);
    router.replace('/(auth)/login');
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <AuthContext.Provider
          value={{
            session,
            profile,
            loading,
            setProfile,
            signOut: handleSignOut,
          }}>
          <Slot />
        </AuthContext.Provider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
