import { useState } from 'react';
import {
  FlatList,
  Image,
  type ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { useUserProfile, type WardrobeSelection, type WardrobeSlot } from '@/storage/userProfileStore';

const nakedMascot = require('../../../assets/images/sprites/nakedMascot.png') as ImageSourcePropType;
const facelessNakedMascot = require('../../../assets/images/sprites/facelessNakedMascot.png') as ImageSourcePropType;
const facelessNakedMascotNecklace = require('../../../assets/images/sprites/facelessNakedMascotNecklace.png') as ImageSourcePropType;
const necklaceSprite = require('../../../assets/images/sprites/necklace.png') as ImageSourcePropType;
const fedoraSprite = require('../../../assets/images/sprites/fedora.png') as ImageSourcePropType;
const cuteFaceSprite = require('../../../assets/images/sprites/cuteFace.png') as ImageSourcePropType;
const shockedFaceSprite = require('../../../assets/images/sprites/shockedFace.png') as ImageSourcePropType;
const ponytailSprite = require('../../../assets/images/sprites/ponytail.png') as ImageSourcePropType;
const wavvyHairSprite = require('../../../assets/images/sprites/wavvyhair.png') as ImageSourcePropType;

type WardrobeItem = {
  id: string;
  label: string;
  image: ImageSourcePropType;
  slot: WardrobeSlot;
};

type Category = {
  label: string;
  slot: WardrobeSlot | 'color';
  items: WardrobeItem[];
};

const CATEGORIES: Category[] = [
  {
    label: 'Acc.',
    slot: 'accessory',
    items: [
      { id: 'necklace', label: 'Necklace', image: necklaceSprite, slot: 'accessory' },
    ],
  },
  {
    label: 'Hair',
    slot: 'hair',
    items: [
      { id: 'ponytail', label: 'Ponytail', image: ponytailSprite, slot: 'hair' },
      { id: 'wavvyhair', label: 'Wavy Hair', image: wavvyHairSprite, slot: 'hair' },
    ],
  },
  {
    label: 'Hats',
    slot: 'hat',
    items: [{ id: 'fedora', label: 'Fedora', image: fedoraSprite, slot: 'hat' }],
  },
  {
    label: 'Face',
    slot: 'face',
    items: [
      { id: 'cuteFace', label: 'Cute Face', image: cuteFaceSprite, slot: 'face' },
      { id: 'shockedFace', label: 'Shocked Face', image: shockedFaceSprite, slot: 'face' },
    ],
  },
  { label: 'Color', slot: 'color', items: [] },
];

const CATEGORY_ORDER: WardrobeSlot[] = ['accessory', 'hair', 'hat', 'face'];

type ItemCellProps = {
  item: WardrobeItem;
  equipped: boolean;
  size: number;
  onPress: () => void;
};

function ItemCell({ item, equipped, size, onPress }: ItemCellProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.itemCell,
        { width: size, height: size, margin: 8 },
        equipped && styles.itemCellEquipped,
      ]}
    >
      <Image source={item.image} resizeMode="contain" style={{ width: size * 0.74, height: size * 0.74 }} />
    </Pressable>
  );
}

function EmptyCategoryView({ label }: { label: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>No {label} items yet</Text>
      <Text style={styles.emptyStateSubtext}>Visit the Shop to unlock cosmetics</Text>
    </View>
  );
}

type MascotPreviewProps = {
  wardrobe: WardrobeSelection;
  size: number;
};

export function WardrobeMascotPreview({ wardrobe, size }: MascotPreviewProps) {
  const shadowWidth = size * 0.56;
  const mascotBox = { width: size, height: size };
  const baseMascot = wardrobe.accessory === 'necklace'
    ? facelessNakedMascotNecklace
    : wardrobe.face
      ? facelessNakedMascot
      : nakedMascot;

  const faceStyle = {
    width: size * 0.54,
    height: size * 0.42,
    left: size * 0.23,
    top: size * 0.27,
  };

  const hairStyle = {
    width: size * 0.78,
    height: size * 0.7,
    left: size * 0.21,
    top: size * 0.02,
    transform: [{ scaleX: 2.5 }],
  };

  const necklaceStyle = {
    width: size * 0.80,
    height: size * 1.2,
    left: size * 0.10,
    top: size * 0,
  };

  const hatStyle = {
    width: size * 0.60,
    height: size * 0.36,
    left: size * 0.20,
    top: size * 0.1,
  };

  return (
    <View style={[styles.mascotStage, { width: size, height: size + 28 }]}> 
      <Image source={baseMascot} resizeMode="contain" style={[styles.mascotLayer, mascotBox]} />
      {wardrobe.face === 'cuteFace' ? (
        <Image source={cuteFaceSprite} resizeMode="contain" style={[styles.mascotLayer, faceStyle]} />
      ) : wardrobe.face === 'shockedFace' ? (
        <Image source={shockedFaceSprite} resizeMode="contain" style={[styles.mascotLayer, faceStyle]} />
      ) : null}
      {wardrobe.hair === 'ponytail' ? (
        <Image source={ponytailSprite} resizeMode="contain" style={[styles.mascotLayer, hairStyle]} />
      ) : wardrobe.hair === 'wavvyhair' ? (
        <Image source={wavvyHairSprite} resizeMode="contain" style={[styles.mascotLayer, hairStyle]} />
      ) : null}
      {wardrobe.hat === 'fedora' ? (
        <Image source={fedoraSprite} resizeMode="contain" style={[styles.mascotLayer, hatStyle]} />
      ) : null}
      <View style={[styles.mascotShadow, { width: shadowWidth }]} />
    </View>
  );
}

type Props = {
  onOpenShop?: () => void;
};

export function WardrobeScreenContent({ onOpenShop }: Props) {
  const { width } = useWindowDimensions();
  const { profile, setWardrobeItem } = useUserProfile();
  const [selectedCategory, setSelectedCategory] = useState(0);

  const NUM_COLUMNS = 3;
  const CELL_MARGIN = 8;
  const GRID_PADDING = 16;
  const rawItemSize = (width - GRID_PADDING * 2 - CELL_MARGIN * 2 * NUM_COLUMNS) / NUM_COLUMNS;
  const itemSize = Math.floor(rawItemSize);
  const mascotSize = Math.min(width * 0.72, 320);

  const category = CATEGORIES[selectedCategory];
  const equippedValue = category.slot !== 'color' ? profile.wardrobe[category.slot] : null;

  const handleItemPress = (item: WardrobeItem) => {
    const currentValue = profile.wardrobe[item.slot];
    setWardrobeItem(item.slot, currentValue === item.id ? null : (item.id as WardrobeSelection[typeof item.slot]));
  };

  return (
    <View style={styles.container}>
      <View style={styles.previewArea}>
        <Pressable onPress={onOpenShop} style={({ pressed }) => [styles.shopBtn, pressed && styles.shopBtnPressed]}>
          <Text style={styles.shopBtnText}>Shop</Text>
        </Pressable>

        <WardrobeMascotPreview wardrobe={profile.wardrobe} size={mascotSize} />
      </View>

      <View style={styles.cosmeticsSection}>
        <View style={styles.categoryBar}>
          {CATEGORIES.map((cat, index) => (
            <Pressable
              key={cat.label}
              onPress={() => setSelectedCategory(index)}
              style={[styles.categoryTab, selectedCategory === index && styles.categoryTabActive]}
            >
              <Text style={[styles.categoryLabel, selectedCategory === index && styles.categoryLabelActive]}>
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {category.items.length === 0 ? (
          <EmptyCategoryView label={category.label} />
        ) : (
          <FlatList
            key={`grid-${selectedCategory}`}
            data={category.items}
            keyExtractor={(item) => item.id}
            numColumns={3}
            contentContainerStyle={styles.gridContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <ItemCell
                item={item}
                equipped={equippedValue === item.id}
                size={itemSize}
                onPress={() => handleItemPress(item)}
              />
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#282425',
  },
  previewArea: {
    flex: 1.6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotStage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotLayer: {
    position: 'absolute',
    resizeMode: 'contain',
  },
  mascotShadow: {
    position: 'absolute',
    bottom: 14,
    height: 18,
    borderRadius: 999,
    backgroundColor: '#000',
    opacity: 0.28,
  },
  shopBtn: {
    position: 'absolute',
    top: 12,
    right: 16,
    zIndex: 1,
    backgroundColor: '#FF9ADA',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 8,
    minWidth: 72,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFF4FB',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  shopBtnPressed: {
    opacity: 0.8,
  },
  shopBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  cosmeticsSection: {
    flex: 1,
  },
  categoryBar: {
    flexDirection: 'row',
    backgroundColor: '#1E1B1D',
    borderTopWidth: 1,
    borderTopColor: '#3A3337',
    borderBottomWidth: 1,
    borderBottomColor: '#3A3337',
  },
  categoryTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF5DE7',
  },
  categoryLabel: {
    color: '#BCAFC2',
    fontSize: 11,
    fontWeight: '700',
  },
  categoryLabelActive: {
    color: '#FF5DE7',
    fontWeight: '800',
  },
  gridContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  itemCell: {
    borderRadius: 12,
    backgroundColor: '#322D30',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  itemCellEquipped: {
    borderColor: '#FF5DE7',
    backgroundColor: '#3D2C3B',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 24,
  },
  emptyStateText: {
    color: '#BCAFC2',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyStateSubtext: {
    color: '#6E6270',
    fontSize: 11,
    fontWeight: '600',
  },
});
