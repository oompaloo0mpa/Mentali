import { useLocalSearchParams, useRouter } from 'expo-router';

import { FriendChatScreenContent } from '@/components/chat/FriendChatScreenContent';

export default function FriendChatScreen() {
  const router = useRouter();
  const { friendId, prefill } = useLocalSearchParams<{ friendId: string; prefill?: string }>();

  return (
    <FriendChatScreenContent
      friendId={friendId}
      prefill={prefill}
      onBack={() => router.back()}
      onOpenStreakGuide={() => router.push('/streak-guide')}
    />
  );
}