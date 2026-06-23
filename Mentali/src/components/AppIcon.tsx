import { Image } from 'expo-image';

// Custom raster icons used in the stat bar and streak displays.
const SOURCES = {
  fire: require('@/assets/images/icons/fire.png'),
  diamond: require('@/assets/images/icons/diamond.png'),
  ice: require('@/assets/images/icons/ice.png'),
};

export type AppIconName = keyof typeof SOURCES;

export function AppIcon({ name, size = 20 }: { name: AppIconName; size?: number }) {
  return <Image source={SOURCES[name]} style={{ width: size, height: size }} contentFit="contain" />;
}
