import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { supabase } from '../../services/supabase';
import { useAuth } from '../_layout';
import StyledButton from '../../components/common/StyledButton';

export default function SettingsScreen() {
  const { session, profile, setProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  // Use local state to manage the toggle optimistically
  const currentUnit = profile?.preferred_unit || 'kg';

  const handleUnitChange = async (newUnit: 'kg' | 'lbs') => {
    if (!session?.user || !profile) return;
    if (newUnit === currentUnit) return; // No change

    setLoading(true);
    // Optimistically update the context
    const oldProfile = profile;
    setProfile({ ...profile, preferred_unit: newUnit });

    const { error } = await supabase
      .from('profiles')
      .update({ preferred_unit: newUnit })
      .eq('id', session.user.id);

    if (error) {
      Alert.alert('Error', 'Could not save your preference.');
      // Revert on error
      setProfile(oldProfile);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Error', 'Could not sign out.');
    }
    // The root _layout.tsx will handle redirecting to login
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Settings' }} />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Units of Measurement</Text>
        <Text style={styles.cardSubtitle}>
          Choose your preferred unit for weight.
        </Text>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                currentUnit === 'kg' && styles.toggleActive,
              ]}
              onPress={() => handleUnitChange('kg')}>
              <Text
                style={[
                  styles.toggleText,
                  currentUnit === 'kg' && styles.toggleActiveText,
                ]}>
                Kilograms (kg)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                currentUnit === 'lbs' && styles.toggleActive,
              ]}
              onPress={() => handleUnitChange('lbs')}>
              <Text
                style={[
                  styles.toggleText,
                  currentUnit === 'lbs' && styles.toggleActiveText,
                ]}>
                Pounds (lbs)
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <StyledButton
        title="Sign Out"
        type="danger"
        onPress={handleSignOut}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007bff',
    overflow: 'hidden',
  },
  toggleButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  toggleActive: {
    backgroundColor: '#007bff',
  },
  toggleText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: 'bold',
  },
  toggleActiveText: {
    color: 'white',
  },
});
