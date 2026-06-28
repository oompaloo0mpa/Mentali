import type { BandLevel } from '@/logic/checkin';
import { colors } from '@/theme/colors';

export function bandColor(level: BandLevel): string {
  switch (level) {
    case 'calm':
      return colors.bandCalm;
    case 'mild':
      return colors.bandMild;
    case 'moderate':
      return colors.bandModerate;
    case 'high':
      return colors.bandHigh;
  }
}
