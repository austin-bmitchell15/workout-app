import { useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Link, router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { supabase } from '@/services/supabase';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');

  async function handleSignUp() {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Please check your email for verification.');
      router.replace('/login');
    }
    setLoading(false);
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Create an Account</ThemedText>

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
        <TextInput
          style={[styles.input, { color: textColor, borderColor: textColor }]}
          placeholder="Confirm Password"
          placeholderTextColor={textColor}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      </ThemedView>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: primaryColor }]}
        onPress={handleSignUp}
        disabled={loading}>
        <ThemedText style={styles.buttonText}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </ThemedText>
      </TouchableOpacity>

      <Link href="/login" style={styles.link}>
        <ThemedText type="link">Already have an account? Sign in</ThemedText>
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
