import { GestureHandlerRootView } from 'react-native-gesture-handler'; // MUST be first
import React, { useState, useEffect, createContext, useContext } from 'react';
import { useRouter, Slot } from 'expo-router';
import { supabase } from '../services/supabase';
import { Session } from '@supabase/supabase-js';
import { View, ActivityIndicator } from 'react-native';
import { Profile } from '../components/types';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

// Define the shape of the Auth context
interface AuthContextType {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  setProfile: (profile: Profile | null) => void;
}

// Create an Auth Context
const AuthContext = createContext<AuthContextType>({
  session: null,
  profile: null,
  loading: true,
  setProfile: () => {},
});

// Custom hook to use the session and profile
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Root layout component
export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
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
        // PGRST116 means no row was found
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

  useEffect(() => {
    if (loading) return;

    // Redirect user based on session
    if (!session) {
      // No session, send to login
      router.replace('/(auth)/login');
    } else if (session) {
      // User is logged in, send to the main app
      router.replace('/(app)');
    }
  }, [session, loading, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Provide the session to all child routes
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
