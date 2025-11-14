import { Redirect } from 'expo-router';

export default function RootIndex() {
  // This component will never be seen by the user.
  // The `app/_layout.js` component will immediately redirect
  // to either '/(auth)/login' or '/(app)'.

  // We can just redirect to the main app group as a fallback,
  // but the logic in _layout.js will override this.
  return <Redirect href="/(app)" />;
}
