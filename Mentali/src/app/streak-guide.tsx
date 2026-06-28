import { useRouter } from 'expo-router';
import { StreakGuideScreenContent } from '@/components/chat/StreakGuideScreenContent';

export default function StreakGuideScreen() {
  const router = useRouter();

  return <StreakGuideScreenContent onClose={() => router.back()} />;
}
