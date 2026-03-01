# Testing

## Framework
- **Jest** ~29.7.0 with **jest-expo** preset
- **@testing-library/react-native** ^13.3.3
- **@testing-library/react-hooks** (via renderHook from RTL)

## Test File Locations
Mirror source tree; tests live in `__tests__/` next to source files:
```
src/services/__tests__/WorkoutService.test.ts
src/hooks/__tests__/useWorkoutForm.test.ts
src/components/workouts/__tests__/ActiveWorkout.test.tsx
src/components/workouts/__tests__/ExerciseLogger.test.tsx
src/components/common/__tests__/StyledButton.test.tsx
src/components/common/__tests__/StyledTextInput.test.tsx
src/app/(auth)/__tests__/login.test.tsx
```

## Jest Configuration (`package.json`)
```json
{
  "jest": {
    "preset": "jest-expo",
    "setupFilesAfterFramework": ["./jest.setup.js"]
  }
}
```

## Global Mocks (`jest.setup.js`)
All mocks are registered here — do not add module-level mocks in test files unless test-specific:

```js
// AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Supabase env vars
process.env.EXPO_PUBLIC_SUPABASE_API_KEY = 'https://mock-url.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_SECRET_KEY = 'mock-key';

// Vector icons
jest.mock('@expo/vector-icons', () => ({
  FontAwesome: 'FontAwesome',
  Ionicons: 'Ionicons',
  MaterialIcons: 'MaterialIcons',
}));

// react-native-reanimated (CRITICAL — must use the provided mock)
jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

// expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Warning: 'Warning', Error: 'Error' },
}));
```

## Supabase Mocking Pattern
Mock Supabase in individual test files:
```ts
jest.mock('@/services/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: {...}, error: null }),
  },
}));
```

## Timer Testing Pattern
`useWorkoutForm` has an elapsed timer — use fake timers:
```ts
beforeEach(() => { jest.useFakeTimers(); });
afterEach(() => { jest.useRealTimers(); });

// Advance timer
act(() => { jest.advanceTimersByTime(1000); });
```

## Hook Testing Pattern
```ts
import { renderHook, act } from '@testing-library/react-native';
import { useWorkoutForm } from '@/hooks/useWorkoutForm';

const { result } = renderHook(() => useWorkoutForm());
act(() => { result.current.addExercise(mockExercise); });
expect(result.current.workout.exercises).toHaveLength(1);
```

## Component Testing Pattern
```tsx
import { render, screen, fireEvent } from '@testing-library/react-native';

render(<ActiveWorkout />);
fireEvent.changeText(screen.getByPlaceholderText('Workout Name'), 'Leg Day');
fireEvent.press(screen.getByText('Finish Workout'));
expect(mockFinishWorkout).toHaveBeenCalled();
```

## Naming Convention
- Files: `<ComponentOrModule>.test.ts(x)`
- Describes: `describe('<ComponentName>', () => { ... })`
- Tests: `it('should <expected> when <condition>')` or `test('<what> <condition> <expected>')`

## Running a Single Test
```bash
yarn test src/hooks/__tests__/useWorkoutForm.test.ts
yarn test --testNamePattern="should add exercise"
```
