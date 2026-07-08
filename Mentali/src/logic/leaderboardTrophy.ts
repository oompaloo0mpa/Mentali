import type { ImageSourcePropType } from 'react-native';

const bronzeTrophy = require('../../assets/images/BronzeTrophy.png') as ImageSourcePropType;
const silverTrophy = require('../../assets/images/SilverTrophy.png') as ImageSourcePropType;
const goldTrophy = require('../../assets/images/GoldTrophy.png') as ImageSourcePropType;

const TIER_TROPHIES: Record<string, ImageSourcePropType> = {
  Bronze: bronzeTrophy,
  Silver: silverTrophy,
  Gold: goldTrophy,
  Platinum: goldTrophy,
};

export function trophyForTier(tier?: string | null): ImageSourcePropType {
  if (!tier) return bronzeTrophy;
  return TIER_TROPHIES[tier] ?? bronzeTrophy;
}
