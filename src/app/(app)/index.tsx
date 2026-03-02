import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import StyledButton from '../../components/common/StyledButton';
import { useAuth } from '../_layout';
import { FontAwesome } from '@expo/vector-icons';
import { useAppTheme } from '@/contexts/ThemeContext';

const DashboardCard = ({
  title,
  icon,
  onPress,
  cardBg,
  cardText,
}: {
  title: string;
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  onPress: () => void;
  cardBg: string;
  cardText: string;
}) => (
  <TouchableOpacity
    style={[styles.card, { backgroundColor: cardBg }]}
    onPress={onPress}>
    <FontAwesome name={icon} size={32} color="#007bff" />
    <Text style={[styles.cardText, { color: cardText }]}>{title}</Text>
  </TouchableOpacity>
);

export default function DashboardScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { colorScheme } = useAppTheme();
  const isDark = colorScheme === 'dark';

  const c = {
    pageBg: isDark ? '#1c1c1e' : '#f5f5f5',
    headerBg: isDark ? '#2c2c2e' : 'white',
    headerBorder: isDark ? '#48484a' : '#eee',
    headerText: isDark ? '#ECEDEE' : '#000',
    cardBg: isDark ? '#2c2c2e' : 'white',
    cardText: isDark ? '#ECEDEE' : '#333',
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.pageBg }]}>
      <Stack.Screen options={{ title: 'Dashboard' }} />

      <View
        style={[
          styles.header,
          { backgroundColor: c.headerBg, borderBottomColor: c.headerBorder },
        ]}>
        <Text style={[styles.headerText, { color: c.headerText }]}>
          Welcome, {profile?.first_name || 'User'}!
        </Text>
      </View>

      {/* Main "Start Workout" Button */}
      <StyledButton
        title="Start New Workout"
        type="primary"
        style={styles.startButton}
        onPress={() => router.push('/log-workout')}
      />

      {/* Grid of other options */}
      <View style={styles.cardContainer}>
        <DashboardCard
          title="Workout History"
          icon="history"
          onPress={() => router.push('/history')}
          cardBg={c.cardBg}
          cardText={c.cardText}
        />
        <DashboardCard
          title="My Templates"
          icon="list-alt"
          onPress={() => router.push('/templates')}
          cardBg={c.cardBg}
          cardText={c.cardText}
        />
        <DashboardCard
          title="My Profile"
          icon="user"
          onPress={() => router.push('/profile')}
          cardBg={c.cardBg}
          cardText={c.cardText}
        />
        <DashboardCard
          title="Settings"
          icon="cog"
          onPress={() => router.push('/settings')}
          cardBg={c.cardBg}
          cardText={c.cardText}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  startButton: {
    margin: 15,
    paddingVertical: 20,
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: '45%',
    padding: 20,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    color: '#333',
  },
});
