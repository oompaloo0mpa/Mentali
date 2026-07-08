import { Image, StyleSheet, Text, View } from 'react-native';

import { trophyForTier } from '@/logic/leaderboardTrophy';
import { Brand } from '@/theme/theme';

type Props = {
  tier?: string | null;
  rank?: number | null;
};

export function RankBadge({ tier, rank }: Props) {
  return (
    <View
      style={styles.badge}
      accessibilityRole="text"
      accessibilityLabel={
        rank != null ? `Leaderboard rank ${rank}, ${tier ?? 'Bronze'} tier` : `${tier ?? 'Bronze'} tier`
      }>
      <Image source={trophyForTier(tier)} resizeMode="contain" style={styles.trophy} />
      {rank != null ? <Text style={styles.rank}>#{rank}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  trophy: {
    width: 28,
    height: 28,
  },
  rank: {
    color: Brand.text,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 13,
  },
});
