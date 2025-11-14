import React, { useRef, useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import ActiveWorkout from '../../components/workouts/ActiveWorkout'; // Import the component
import { useRouter } from 'expo-router';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetHandle, // This is the visual grabber
} from '@gorhom/bottom-sheet';

export default function LogWorkoutScreen() {
  const router = useRouter();

  // ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // variables
  const snapPoints = useMemo(() => ['75%', '95%'], []);

  // Open the modal automatically when the screen loads
  useEffect(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleDismiss = () => {
    // When the user slides the modal down, navigate back
    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      {/* This screen is now just a container for the Bottom Sheet.
        The `presentation: 'transparentModal'` in _layout.tsx
        makes this container see-through, so you see the Dashboard behind it.
      */}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1} // Start at the 95% snap point
        snapPoints={snapPoints}
        onDismiss={handleDismiss}
        // This adds the "pill" / "grabber"
        handleComponent={props => (
          <View style={styles.handleContainer}>
            <BottomSheetHandle {...props} />
          </View>
        )}>
        {/* Use BottomSheetScrollView so the workout can scroll */}
        <BottomSheetScrollView style={styles.contentContainer}>
          <ActiveWorkout />
        </BottomSheetScrollView>
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // The background is blurred by the BottomSheetModal by default
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Background for the sheet content
  },
  handleContainer: {
    backgroundColor: '#f5f5f5', // Match content background
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingTop: 10, // Give some space for the grabber
  },
});
