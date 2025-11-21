import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { useAuth } from '../_layout';
import StyledButton from '../../components/common/StyledButton';

export default function ProfileScreen() {
  const { profile } = useAuth();

  const handleUpdateUsername = () => {
    Alert.alert(
      'Not Implemented',
      'This feature will allow you to update your username.',
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'My Profile' }} />

      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{useAuth().session?.user.email}</Text>

        <Text style={styles.label}>Username</Text>
        <Text style={styles.value}>{profile?.username || 'Not set'}</Text>

        <StyledButton
          title="Edit Username"
          style={{ marginTop: 20 }}
          onPress={handleUpdateUsername}
        />
      </View>
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
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginTop: 15,
  },
  value: {
    fontSize: 18,
    color: '#000',
    fontWeight: 'bold',
    marginTop: 5,
  },
});
