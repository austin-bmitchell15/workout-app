import React from 'react';
import { Alert } from 'react-native';
import { useWorkoutForm } from '@/hooks/useWorkoutForm';
import WorkoutFormView from './WorkoutFormView';

export default function ActiveWorkout() {
  const {
    workout,
    isSaving,
    isPickerVisible,
    preferredUnit,
    setPickerVisible,
    updateWorkoutField,
    addExercise,
    removeExercise,
    updateExercise,
    finishWorkout,
    resetWorkout,
  } = useWorkoutForm();

  const handleCancelPress = () => {
    Alert.alert(
      'Cancel Workout?',
      'Are you sure you want to discard this workout?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: resetWorkout,
        },
      ],
    );
  };

  return (
    <WorkoutFormView
      workout={workout}
      isSaving={isSaving}
      isPickerVisible={isPickerVisible}
      preferredUnit={preferredUnit}
      onPickerOpen={() => setPickerVisible(true)}
      onPickerClose={() => setPickerVisible(false)}
      onPickerSelect={addExercise}
      onWorkoutNameChange={(text: string) => updateWorkoutField('name', text)}
      onWorkoutNotesChange={(text: string) => updateWorkoutField('notes', text)}
      onExerciseChange={updateExercise}
      onExerciseRemove={removeExercise}
      onFinish={finishWorkout}
      onCancel={handleCancelPress}
    />
  );
}
