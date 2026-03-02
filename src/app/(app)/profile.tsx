import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Stack } from 'expo-router';
import { supabase } from '@/services/supabase';
import { useAuth } from '../_layout';
import { useAppTheme } from '@/contexts/ThemeContext';
import StyledTextInput from '@/components/common/StyledTextInput';
import StyledButton from '@/components/common/StyledButton';

export default function ProfileScreen() {
  const { profile, session, setProfile } = useAuth();
  const { colorScheme } = useAppTheme();
  const isDark = colorScheme === 'dark';

  const [firstName, setFirstName] = useState(profile?.first_name ?? '');
  const [lastName, setLastName] = useState(profile?.last_name ?? '');
  const [loading, setLoading] = useState(false);

  const isDirty =
    firstName !== (profile?.first_name ?? '') ||
    lastName !== (profile?.last_name ?? '');

  const handleSave = async () => {
    if (!session?.user || !profile) return;

    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ first_name: firstName.trim(), last_name: lastName.trim() })
      .eq('id', session.user.id);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setProfile({
        ...profile,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });
      Alert.alert('Saved', 'Your profile has been updated.');
    }
    setLoading(false);
  };

  const c = {
    pageBg: isDark ? '#1c1c1e' : '#f2f2f7',
    cardBg: isDark ? '#2c2c2e' : '#fff',
    primaryText: isDark ? '#ECEDEE' : '#000',
    secondaryText: isDark ? '#9BA1A6' : '#6e6e73',
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={[styles.container, { backgroundColor: c.pageBg }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <Stack.Screen options={{ title: 'Edit Profile' }} />

        <Text style={[styles.sectionHeader, { color: c.secondaryText }]}>
          NAME
        </Text>
        <View style={[styles.card, { backgroundColor: c.cardBg }]}>
          <Text style={[styles.fieldLabel, { color: c.secondaryText }]}>
            First Name
          </Text>
          <StyledTextInput
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
          />
          <Text
            style={[
              styles.fieldLabel,
              styles.fieldLabelSpaced,
              { color: c.secondaryText },
            ]}>
            Last Name
          </Text>
          <StyledTextInput
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
          />
        </View>

        <Text style={[styles.sectionHeader, { color: c.secondaryText }]}>
          ACCOUNT
        </Text>
        <View style={[styles.card, { backgroundColor: c.cardBg }]}>
          <Text style={[styles.fieldLabel, { color: c.secondaryText }]}>
            Email
          </Text>
          <Text style={[styles.emailValue, { color: c.primaryText }]}>
            {session?.user.email ?? '—'}
          </Text>
        </View>

        <StyledButton
          title={loading ? 'Saving...' : 'Save Changes'}
          type="primary"
          onPress={handleSave}
          isLoading={loading}
          disabled={!isDirty || loading}
          style={styles.saveButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 12,
    padding: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
  },
  fieldLabelSpaced: {
    marginTop: 14,
  },
  emailValue: {
    fontSize: 16,
    paddingVertical: 4,
  },
  saveButton: {
    marginTop: 24,
  },
});
