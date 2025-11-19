import React, { useRef, useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import ActiveWorkout from '../../components/workouts/ActiveWorkout';
import { useRouter } from 'expo-router';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetHandle,
} from '@gorhom/bottom-sheet';

export default function LogWorkoutScreen() {
  const router = useRouter();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ['75%', '95%'], []);

  useEffect(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleDismiss = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        onDismiss={handleDismiss}
        handleComponent={props => (
          <View style={styles.handleContainer}>
            <BottomSheetHandle {...props} />
          </View>
        )}>
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
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  handleContainer: {
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingTop: 10,
  },
});
