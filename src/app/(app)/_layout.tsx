import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

export default function AppLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007bff', // Example header color
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Dashboard',
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/settings')}>
              <FontAwesome
                name="cog"
                size={24}
                color="white"
                style={{ position: 'relative', alignItems: 'center' }}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="log-workout"
        options={{
          title: 'Log New Workout',
          presentation: 'modal', // Opens as a pop-up
        }}
      />
      <Stack.Screen
        name="history"
        options={{
          title: 'Workout History',
        }}
      />
      <Stack.Screen
        name="templates"
        options={{
          title: 'Workout Templates',
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: 'Settings',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Stack>
  );
}
