import Papa from 'papaparse';
import { z } from 'zod'; //
import { supabase } from './supabase';
import { LocalWorkout, LocalExercise, LocalSet } from '../components/types';
import { saveWorkout } from './WorkoutService';

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

// 2. Infer the TypeScript type from the Schema (Single source of truth)
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
    .insert({ name, image_url: null })
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
  // Parse as 'unknown' first so we can validate it
  const { data } = Papa.parse<unknown>(csvContent, {
    header: true,
    dynamicTyping: true, // Still helpful, but Zod does the heavy lifting
    skipEmptyLines: true,
  });

  if (!data || data.length === 0) {
    throw new Error('No data found in CSV');
  }

  // 3. Validate Rows
  const validRows: StrongCsvRow[] = [];
  const errors: string[] = [];

  data.forEach((row, index) => {
    const result = StrongCsvRowSchema.safeParse(row);
    if (result.success) {
      validRows.push(result.data);
    } else {
      // Log error but don't crash. Good for debugging bad imports.
      console.warn(`Skipping invalid row at index ${index}:`, result.error);
      errors.push(`Row ${index + 1} is invalid`);
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
      id: Math.random().toString(36).substr(2, 9), // Temp ID for UI
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

    const localExercises: LocalExercise[] = [];

    // Resolve Exercise IDs
    for (const ex of w.exercises) {
      try {
        const libraryId = await getOrCreateExerciseId(ex.name);

        const sets: LocalSet[] = ex.sets.map(s => ({
          local_id: Math.random().toString(),
          set_number: s.set_number,
          weight: s.weight.toString(),
          reps: s.reps.toString(),
        }));

        localExercises.push({
          local_id: Math.random().toString(),
          exercise_library_id: libraryId,
          name: ex.name,
          notes: '',
          sets,
        });
      } catch (err) {
        console.error(`Failed to map exercise ${ex.name}`, err);
      }
    }

    const workoutToSave: LocalWorkout = {
      name: w.name,
      notes: `Imported from Strong. Duration: ${w.duration}`,
      exercises: localExercises,
    };

    await saveWorkout(workoutToSave, userId, sourceUnit, w.date);
    processed++;
  }

  return { success: true, count: processed };
}
