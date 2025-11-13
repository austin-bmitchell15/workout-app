import { supabase } from '@/services/supabase';
import { useSession } from '@/providers/session-provider';
import { View, Text, Button } from 'react-native';

export default function Index() {
  const { session } = useSession();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome, {session?.user?.email}</Text>
      <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
    </View>
  );
}
