import React from 'react';
import { StyleSheet, View } from 'react-native';
import ActiveWorkout from '../../components/workouts/ActiveWorkout';

export default function LogWorkoutScreen() {
  return (
    <View style={styles.container}>
      <ActiveWorkout />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Give it a solid background color again
  },
});
