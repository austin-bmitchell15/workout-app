import { useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { supabase } from '@/services/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');

  async function handleLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert('Error', error.message);
    }
    setLoading(false);
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Welcome Back!</ThemedText>
      <ThemedText type="subtitle">Sign in to your account</ThemedText>

      <ThemedView style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { color: textColor, borderColor: textColor }]}
          placeholder="Email"
          placeholderTextColor={textColor}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={[styles.input, { color: textColor, borderColor: textColor }]}
          placeholder="Password"
          placeholderTextColor={textColor}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </ThemedView>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: primaryColor }]}
        onPress={handleLogin}
        disabled={loading}>
        <ThemedText style={styles.buttonText}>
          {loading ? 'Logging in...' : 'Login'}
        </ThemedText>
      </TouchableOpacity>

      <Link href="/sign-up" style={styles.link}>
        <ThemedText type="link">Don&apos;t have an account? Sign up</ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  inputContainer: {
    gap: 12,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  link: {
    marginTop: 16,
    textAlign: 'center',
  },
});
