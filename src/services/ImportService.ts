import Papa from 'papaparse';
import { z } from 'zod';
import { supabase } from './supabase';
import {
  FullWorkoutSubmission,
  ExerciseSubmission,
  SetSubmission,
} from '@/types/types';
import { saveWorkout } from './WorkoutService';

const KG_TO_LBS = 2.20462;

export interface ImportableWorkout {
  id: string; // Temporary ID for list selection
  date: string;
  name: string;
  duration: string;
  exercises: {
    name: string;
    sets: {
      set_number: number;
      weight: number;
      reps: number;
    }[];
  }[];
}

// 1. Define Zod Schema for runtime validation
const StrongCsvRowSchema = z.object({
  Date: z.string(),
  'Workout Name': z.string(),
  Duration: z.string().optional().default(''),
  'Exercise Name': z.string(),
  'Set Order': z.coerce.number(), // Forces string "1" to number 1
  Weight: z.coerce.number().optional().default(0), // "225.5" -> 225.5, "" -> 0
  Reps: z.coerce.number().optional().default(0),
  Distance: z.coerce.number().optional().default(0),
  Seconds: z.coerce.number().optional().default(0),
  RPE: z.coerce.number().optional().default(0),
  Notes: z.string().optional(),
});

type StrongCsvRow = z.infer<typeof StrongCsvRowSchema>;

// Helper to find or create an exercise in the DB
async function getOrCreateExerciseId(name: string): Promise<string> {
  const { data: existing } = await supabase
    .from('exercise_library')
    .select('id')
    .ilike('name', name)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: newExercise, error } = await supabase
    .from('exercise_library')
    .insert({ name, image_url: null, primary_muscle_group: 'Other' })
    .select()
    .single();

  if (error) throw error;
  return newExercise.id;
}

/**
 * PHASE 1: Parse CSV into a clean structure for previewing.
 * Does NOT interact with the database.
 */
export function parseStrongCsv(csvContent: string): ImportableWorkout[] {
  const { data } = Papa.parse<unknown>(csvContent, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  if (!data || data.length === 0) {
    throw new Error('No data found in CSV');
  }

  const validRows: StrongCsvRow[] = [];

  data.forEach((row, index) => {
    const result = StrongCsvRowSchema.safeParse(row);
    if (result.success) {
      validRows.push(result.data);
    } else {
      console.warn(`Skipping invalid row at index ${index}:`, result.error);
    }
  });

  if (validRows.length === 0) {
    throw new Error(
      'No valid rows found in CSV. Please check the file format.',
    );
  }

  // Group by Workout (Date + Name)
  const groupedWorkouts = new Map<string, StrongCsvRow[]>();

  validRows.forEach(row => {
    const key = `${row.Date}|${row['Workout Name']}`;
    if (!groupedWorkouts.has(key)) {
      groupedWorkouts.set(key, []);
    }
    groupedWorkouts.get(key)?.push(row);
  });

  const results: ImportableWorkout[] = [];

  for (const [, rows] of groupedWorkouts) {
    const firstRow = rows[0];

    // Group by Exercise within this workout
    const exercisesMap = new Map<string, StrongCsvRow[]>();
    rows.forEach(row => {
      const exName = row['Exercise Name'];
      if (!exercisesMap.has(exName)) exercisesMap.set(exName, []);
      exercisesMap.get(exName)?.push(row);
    });

    const parsedExercises = [];
    for (const [exName, exRows] of exercisesMap) {
      const sets = exRows.map(row => ({
        set_number: row['Set Order'],
        weight: row.Weight || 0,
        reps: row.Reps || 0,
      }));
      parsedExercises.push({ name: exName, sets });
    }

    results.push({
      id: Math.random().toString(36).substr(2, 9),
      date: firstRow.Date,
      name: firstRow['Workout Name'],
      duration: firstRow.Duration,
      exercises: parsedExercises,
    });
  }

  return results.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

/**
 * PHASE 2: Save selected workouts to the database.
 * Resolves exercise IDs and creates records.
 */
export async function batchSaveWorkouts(
  workouts: ImportableWorkout[],
  userId: string,
  sourceUnit: 'kg' | 'lbs',
  onProgress?: (current: number, total: number) => void,
) {
  let processed = 0;
  const total = workouts.length;

  for (const w of workouts) {
    if (onProgress) onProgress(processed + 1, total);

    const exercisesSubmission: ExerciseSubmission[] = [];

    // Resolve Exercise IDs
    for (const ex of w.exercises) {
      try {
        const libraryId = await getOrCreateExerciseId(ex.name);

        const sets: SetSubmission[] = ex.sets.map(s => {
          // CONVERSION LOGIC:
          // If the CSV was in LBS, convert to KG before saving.
          // If CSV was KG, keep as is.
          const finalWeight =
            sourceUnit === 'lbs' ? s.weight / KG_TO_LBS : s.weight;

          return {
            user_id: userId,
            set_number: s.set_number,
            weight: finalWeight,
            reps: s.reps,
            unit: 'kg',
          };
        });

        exercisesSubmission.push({
          data: {
            exercise_library_id: libraryId,
            user_id: userId,
            notes: '',
          },
          sets,
        });
      } catch (err) {
        console.error(`Failed to map exercise ${ex.name}`, err);
      }
    }

    const workoutToSave: FullWorkoutSubmission = {
      workout: {
        name: w.name,
        created_at: new Date(w.date).toISOString(),
        user_id: userId,
      },
      exercises: exercisesSubmission,
    };

    await saveWorkout(workoutToSave);
    processed++;
  }

  return { success: true, count: processed };
}
