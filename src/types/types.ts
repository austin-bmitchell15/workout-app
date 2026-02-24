export interface LocalSet {
  local_id: string;
  reps: string;
  weight: string;
  set_number: number;
}

export interface LocalExercise {
  local_id: string;
  exercise_library_id: string;
  name: string;
  image_url: string | null;
  notes: string;
  sets: LocalSet[];
}

export interface LocalWorkout {
  name: string;
  notes: string;
  exercises: LocalExercise[];
}
