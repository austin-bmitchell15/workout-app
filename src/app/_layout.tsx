import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  useRouter,
  Slot,
  useSegments,
  useRootNavigationState,
} from 'expo-router';
import { supabase } from '../services/supabase';
import { Session } from '@supabase/supabase-js';
import { View, ActivityIndicator } from 'react-native';
import { Profile } from '../components/types';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

interface AuthContextType {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  setProfile: (profile: Profile | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  profile: null,
  loading: true,
  setProfile: () => {},
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

  useEffect(() => {
    // Fetch the session on mount
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        if (session) {
          fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Session check failed:', err);
        setLoading(false); // Ensure we don't get stuck on spinner
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- NAVIGATION PROTECTION LOGIC ---
  useEffect(() => {
    if (loading) return;

    // Wait for navigation to be ready
    if (!rootNavigationState?.key) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      // If not logged in and not in (auth) group, go to login
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      // If logged in and stuck in (auth) group, go to app
      router.replace('/(app)');
    }
  }, [session, loading, segments, rootNavigationState?.key]);

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
        <AuthContext.Provider value={{ session, profile, loading, setProfile }}>
          <Slot />
        </AuthContext.Provider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
