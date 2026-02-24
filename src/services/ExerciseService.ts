import { supabase } from './supabase';

export const fetchExerciseLibrary = async () => {
  const { data, error } = await supabase
    .from('exercise_library')
    .select('id, name, image_url, primary_muscle_group')
    .order('name');

  return { data, error };
};
