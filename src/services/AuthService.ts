import { Profile } from '@/types/schema';
import { supabase } from './supabase';
import { Session } from '@supabase/supabase-js';

// --- Authentication Actions ---

export async function signInWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  return { error };
}

export async function signUpWithEmail(email: string, password: string) {
  const {
    data: { session },
    error,
  } = await supabase.auth.signUp({
    email: email,
    password: password,
  });

  return { session, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// --- Session & Profile Management ---

export async function getInitialSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  return data.session;
}

export function onAuthStateChange(callback: (session: Session | null) => void) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return data.subscription;
}

export async function getUserProfile(
  userId: string,
): Promise<{ data: Profile | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      return { data: null, error };
    }
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}
