import { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { supabase } from '@/services/supabase';
import StyledButton from '@/components/common/StyledButton'; // Imported
import StyledTextInput from '@/components/common/StyledTextInput'; // Imported

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) Alert.alert('Error', error.message);
    setLoading(false);
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Welcome Back!</ThemedText>
      <ThemedText type="subtitle">Sign in to your account</ThemedText>

      <ThemedView style={styles.inputContainer}>
        <StyledTextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <StyledTextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </ThemedView>

      <StyledButton
        title={loading ? 'Logging in...' : 'Login'}
        onPress={handleLogin}
        type="primary"
        isLoading={loading}
      />

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
  link: {
    marginTop: 16,
    textAlign: 'center',
  },
});
