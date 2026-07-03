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

const thinkingMascot = require('../../../assets/images/thinkingMascot.png') as ImageSourcePropType;
const mascotCape = require('../../../assets/images/MascotCape.png') as ImageSourcePropType;

type CosmeticItem = {
  id: string;
  name: string;
  image: ImageSourcePropType;
  mascotImage?: ImageSourcePropType;
};

type Category = {
  label: string;
  items: CosmeticItem[];
};

const CATEGORIES: Category[] = [
  {
    label: 'Acc.',
    items: [
      {
        id: 'cape',
        name: 'Cape',
        image: require('../../../assets/images/Cape.png') as ImageSourcePropType,
        mascotImage: mascotCape,
      },
      {
        id: 'necklace',
        name: 'Necklace',
        image: require('../../../assets/images/Necklace.png') as ImageSourcePropType,
      },
      {
        id: 'badge',
        name: 'Badge',
        image: require('../../../assets/images/Badge.png') as ImageSourcePropType,
      },
      {
        id: 'textspeech',
        name: 'Speech',
        image: require('../../../assets/images/TextSpeech.png') as ImageSourcePropType,
      },
    ],
  },
  { label: 'Hair', items: [] },
  { label: 'Hats', items: [] },
  { label: 'Face', items: [] },
  { label: 'Color', items: [] },
];

function getMascotImage(equippedId: string | null): ImageSourcePropType {
  if (!equippedId) return thinkingMascot;
  for (const cat of CATEGORIES) {
    for (const item of cat.items) {
      if (item.id === equippedId && item.mascotImage) {
        return item.mascotImage;
      }
    }
  }
  return thinkingMascot;
}

type ItemCellProps = {
  item: CosmeticItem;
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
      <Image
        source={item.image}
        resizeMode="contain"
        style={{ width: size * 0.7, height: size * 0.7 }}
      />
    </Pressable>
  );
}

type EmptyCategory = {
  label: string;
};

function EmptyCategoryView({ label }: EmptyCategory) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>No {label} items yet</Text>
      <Text style={styles.emptyStateSubtext}>Visit the Shop to unlock cosmetics</Text>
    </View>
  );
}

type Props = {
  onOpenShop?: () => void;
};

export function WardrobeScreenContent({ onOpenShop }: Props) {
  const { width } = useWindowDimensions();
  const NUM_COLUMNS = 3;
  const CELL_MARGIN = 8;
  const GRID_PADDING = 16;
  const rawItemSize = (width - GRID_PADDING * 2 - CELL_MARGIN * 2 * NUM_COLUMNS) / NUM_COLUMNS;
  const itemSize = Math.floor(rawItemSize);
  const mascotSize = Math.min(width * 0.72, 320);

  const [selectedCategory, setSelectedCategory] = useState(0);
  const [equippedId, setEquippedId] = useState<string | null>(null);

  const category = CATEGORIES[selectedCategory];
  const mascotImage = getMascotImage(equippedId);

  const handleItemPress = (id: string) => {
    setEquippedId((prev) => (prev === id ? null : id));
  };

  return (
    <View style={styles.container}>
      {/* Mascot preview + Shop button — takes up the majority of the screen */}
      <View style={styles.previewArea}>
        <Pressable
          onPress={onOpenShop}
          style={({ pressed }) => [styles.shopBtn, pressed && styles.shopBtnPressed]}
        >
          <Text style={styles.shopBtnText}>Shop</Text>
        </Pressable>

        <View style={styles.mascotWrap}>
          <Image
            source={mascotImage}
            resizeMode="contain"
            style={{ width: mascotSize, height: mascotSize }}
          />
          <View style={[styles.mascotShadow, { width: mascotSize * 0.55 }]} />
        </View>
      </View>

      {/* Cosmetics section — fixed tabs + smaller scrollable grid */}
      <View style={styles.cosmeticsSection}>
        <View style={styles.categoryBar}>
          {CATEGORIES.map((cat, index) => (
            <Pressable
              key={cat.label}
              onPress={() => setSelectedCategory(index)}
              style={[styles.categoryTab, selectedCategory === index && styles.categoryTabActive]}
            >
              <Text
                style={[
                  styles.categoryLabel,
                  selectedCategory === index && styles.categoryLabelActive,
                ]}
              >
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
                equipped={equippedId === item.id}
                size={itemSize}
                onPress={() => handleItemPress(item.id)}
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
  // Dominant top section — the mascot preview takes up most of the screen.
  previewArea: {
    flex: 1.6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotShadow: {
    marginTop: -14,
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
  // Smaller bottom section for cosmetics — fixed tabs + compact grid.
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
