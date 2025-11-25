import { supabase } from './supabase';

export async function signInWithEmail(email: string, password: string) {
  return await supabase.auth.signInWithPassword({
    email: email,
    password: password,
 });
}

export async function signUpWithEmail(email: string, password: string) {
  return await supabase.auth.signUp({
    email: email,
    password: password,
  });
}
