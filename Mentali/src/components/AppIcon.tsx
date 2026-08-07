import { Image } from 'expo-image';

const SOURCES = {
  fire: require('../../assets/images/icons/fire.png'),
  diamond: require('../../assets/images/icons/diamond.png'),
  ice: require('../../assets/images/icons/ice.png'),
};

export type AppIconName = keyof typeof SOURCES;

export function AppIcon({
  name,
  size = 20,
  tintColor,
}: {
  name: AppIconName;
  size?: number;
  tintColor?: string;
}) {
  return <Image source={SOURCES[name]} style={{ width: size, height: size, tintColor }} contentFit="contain" />;
}
