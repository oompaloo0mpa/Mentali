import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FriendsScreenContent } from '@/components/social/FriendsScreenContent';

export default function SocialScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#282425' }} edges={['top']}>
      <FriendsScreenContent
        onOpenChat={(friend) => router.push({ pathname: '/chat/[friendId]', params: { friendId: friend.id } })}
      />
    </SafeAreaView>
  );
}