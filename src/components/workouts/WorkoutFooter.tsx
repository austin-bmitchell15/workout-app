import StyledButton from '../common/StyledButton';
import { StyleSheet, View } from 'react-native';

export const WorkoutFooter = ({
  onAdd,
  onFinish,
  onCancel,
  isSaving,
}: {
  onAdd: () => void;
  onFinish: () => void;
  onCancel: () => void;
  isSaving: boolean;
}) => (
  <View style={styles.container}>
    <StyledButton title="+ Add Exercise" onPress={onAdd} />
    <StyledButton
      title="Finish Workout"
      onPress={onFinish}
      type="primary"
      style={{ marginTop: 10 }}
      disabled={isSaving}
    />
    <StyledButton
      title="Cancel Workout"
      onPress={onCancel}
      type="danger"
      style={{ marginTop: 10 }}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { marginTop: 10, marginBottom: 20 },
});
