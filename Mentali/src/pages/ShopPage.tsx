import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  Dimensions,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/nav/BottomNav';
import { WardrobeScreenContent } from '@/components/wardrobe/WardrobeScreenContent';
import { fetchShopInventory, fetchShopItems, purchaseShopItem, type ShopCatalogRow } from '@/services/api';
import { useUserProfile } from '@/storage/userProfileStore';

type ShopItemId =
  | 'sonic-shoes'
  | 'tung-buddy'
  | 'cap'
  | 'cute-cap'
  | 'glasses'
  | 'royal-crown'
  | 'brainfreeze';

type Category = 'Hair' | 'Hats' | 'Face' | 'Color' | 'Shoes';
type ScreenMode = 'shop' | 'wardrobe' | 'preview';

type ShopItem = {
  id: ShopItemId;
  name: string;
  price: number;
  category: Category;
  section: 'cosmetics' | 'items';
  remoteId?: string | null;
  description?: string;
  available?: boolean;
  owned?: boolean;
};

const windowWidth = Dimensions.get('window').width;
const bannerWidth = Math.min(windowWidth - 48, 390);

const shopImages = {
  coins: require('../../assets/images/shop/Coins.png'),
  featuredRibbon: require('../../assets/images/shop/Featured.png'),
  featuredBanner: require('../../assets/images/shop/LimitedSetGodzilla.png'),
  mascot: require('../../assets/images/shop/Mascot.png'),
  items: {
    brainfreeze: require('../../assets/images/shop/Brainfreeze.png'),
    'sonic-shoes': require('../../assets/images/shop/SonicShoes.png'),
    'tung-buddy': require('../../assets/images/shop/Tung Buddy.png'),
    cap: require('../../assets/images/shop/Cap.png'),
    'cute-cap': require('../../assets/images/shop/CuteCap.png'),
    glasses: require('../../assets/images/shop/Glasses.png'),
    'royal-crown': require('../../assets/images/shop/RoyalCrown.png'),
  } as Partial<Record<ShopItemId, number>>,
};

type Props = {
  onNavigate?: (navItem: string) => void;
};

const cosmetics: ShopItem[] = [
  { id: 'sonic-shoes', name: 'Sonic Shoes', price: 45, category: 'Shoes', section: 'cosmetics' },
  { id: 'tung-buddy', name: 'Tung Buddy', price: 80, category: 'Hats', section: 'cosmetics' },
  { id: 'cap', name: 'Cap', price: 45, category: 'Hats', section: 'cosmetics' },
  { id: 'cute-cap', name: 'Cute Cap', price: 45, category: 'Hats', section: 'cosmetics' },
  { id: 'glasses', name: 'Glasses', price: 80, category: 'Face', section: 'cosmetics' },
  { id: 'royal-crown', name: 'Royal Crown', price: 1000, category: 'Hats', section: 'cosmetics' },
];

const items: ShopItem[] = [
  { id: 'brainfreeze', name: 'Brainfreeze', price: 200, category: 'Color', section: 'items' },
];
const baseShopItems = [...cosmetics, ...items];

const categories: Category[] = ['Hair', 'Hats', 'Face', 'Color', 'Shoes'];

const banners = [
  {
    id: 'godzilla',
    kind: 'image' as const,
    title: 'Limited Set: Godzilla',
    subtitle: 'Ends 6/7',
  },
  {
    id: 'brainy-bundle',
    kind: 'custom' as const,
    title: 'Brainy Bundle',
    subtitle: 'New this week',
    background: ['#ff87d4', '#ff6b43'],
    accent: '#fff0f8',
  },
  {
    id: 'summer-drop',
    kind: 'custom' as const,
    title: 'Summer Drop',
    subtitle: 'Limited hats',
    background: ['#ffa857', '#ff4fb0'],
    accent: '#fff7d8',
  },
];

function PriceTag({ value, large = false }: { value: number; large?: boolean }) {
  return (
    <View style={styles.priceRow}>
      <Image
        source={shopImages.coins}
        style={[styles.priceCoin, large && styles.priceCoinLarge]}
        resizeMode="contain"
      />
      <Text style={[styles.priceText, large && styles.priceTextLarge]}>{value}</Text>
    </View>
  );
}

function ItemTile({
  item,
  selected,
  onPress,
}: {
  item: ShopItem;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.itemTile, selected && styles.itemTileSelected]}>
      <View style={styles.itemImageCard}>
        <Image source={shopImages.items[item.id]} style={styles.itemImage} resizeMode="contain" />
      </View>
      <Text style={styles.itemName}>{item.name}</Text>
      {item.owned ? <Text style={styles.itemMetaOwned}>Owned</Text> : null}
      {item.available === false ? <Text style={styles.itemMetaUnavailable}>Unavailable</Text> : null}
      <PriceTag value={item.price} />
    </Pressable>
  );
}

function FeaturedCard({
  banner,
}: {
  banner: (typeof banners)[number];
}) {
  if (banner.kind === 'image') {
    return (
      <View style={styles.bannerCard}>
        <Image source={shopImages.featuredBanner} style={styles.bannerImage} resizeMode="cover" />
        <View style={styles.bannerCaption}>
          <Text style={styles.bannerCaptionTitle}>{banner.title}</Text>
          <Text style={styles.bannerCaptionMeta}>{banner.subtitle}</Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.bannerCard,
        {
          backgroundColor: banner.background[0],
        },
      ]}>
      <View style={[styles.customBannerGlow, { backgroundColor: banner.background[1] }]} />
      <View style={styles.customBannerShapes}>
        <View style={styles.customBlobLarge} />
        <View style={styles.customBlobSmall} />
      </View>
      <Text style={[styles.customBannerEyebrow, { color: banner.accent }]}>SPECIAL DROP</Text>
      <Text style={[styles.customBannerTitle, { color: '#fffafc' }]}>{banner.title}</Text>
      <Text style={[styles.customBannerMeta, { color: banner.accent }]}>{banner.subtitle}</Text>
    </View>
  );
}

export default function ShopPage({ onNavigate }: Props) {
  const router = useRouter();
  const { profile, refreshProfileStats } = useUserProfile();
  const [catalog, setCatalog] = useState<ShopCatalogRow[]>([]);
  const [ownedItemIds, setOwnedItemIds] = useState<string[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<ShopItemId>('sonic-shoes');
  const [screenMode, setScreenMode] = useState<ScreenMode>('shop');
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [purchaseMessage, setPurchaseMessage] = useState('');
  const [shopError, setShopError] = useState<string | null>(null);
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const [buying, setBuying] = useState(false);
  const [bannerIndex, setBannerIndex] = useState(0);
  const bannerScrollRef = useRef<ScrollView | null>(null);

  const mergedItems = baseShopItems.map((item) => {
    const remote = catalog.find((entry) => entry.clientKey === item.id);
    return {
      ...item,
      name: remote?.name ?? item.name,
      price: Number(remote?.price ?? item.price),
      description: remote?.description ?? '',
      remoteId: remote?._id ?? null,
      available: !!remote,
      owned: remote ? ownedItemIds.includes(remote._id) : false,
    };
  });
  const selectedItem = mergedItems.find((item) => item.id === selectedItemId) ?? mergedItems[0]!;
  const cosmeticItems = mergedItems.filter((item) => item.section === 'cosmetics');
  const consumableItems = mergedItems.filter((item) => item.section === 'items');
  const selectedCategory = selectedItem.category;
  const previewItems = mergedItems.filter((item) => item.category === selectedCategory);

  useEffect(() => {
    let active = true;

    fetchShopItems()
      .then((rows) => {
        if (!active) return;
        setCatalog(rows);
        setShopError(null);
      })
      .catch((error) => {
        if (!active) return;
        setShopError(error instanceof Error ? error.message : 'Could not load shop items.');
      })
      .finally(() => {
        if (active) setCatalogLoaded(true);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!profile.userId) {
      setOwnedItemIds([]);
      return;
    }

    let active = true;
    fetchShopInventory(profile.userId)
      .then((rows) => {
        if (!active) return;
        setOwnedItemIds(rows.map((row) => row.itemId));
      })
      .catch(() => {
        if (!active) return;
        setOwnedItemIds([]);
      });

    return () => {
      active = false;
    };
  }, [profile.userId]);

  const onBannerScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const nextIndex = Math.round(offsetX / bannerWidth);
    if (nextIndex !== bannerIndex) {
      setBannerIndex(nextIndex);
    }
  };

  const openConfirm = (item: ShopItem) => {
    setSelectedItemId(item.id);
    setSuccessVisible(false);
    setConfirmVisible(true);
  };

  const handleNo = () => {
    setConfirmVisible(false);
  };

  const handlePreview = () => {
    setConfirmVisible(false);
    setScreenMode('preview');
  };

  const handleNavSelect = (navItem: string) => {
    if (navItem === 'bag-outline') {
      setScreenMode('shop');
      return;
    }

    if (navItem === 'shirt-outline') {
      setScreenMode('wardrobe');
      return;
    }

    if (navItem === 'trophy-outline' && !onNavigate) {
      router.replace('/LeaderboardPage');
      return;
    }

    onNavigate?.(navItem);
  };

  const handleBuy = async () => {
    setConfirmVisible(false);

    if (!profile.userId) {
      setPurchaseMessage('Sign in to buy items.');
      setSuccessVisible(true);
      return;
    }

    if (!selectedItem.available) {
      setPurchaseMessage('This item is not linked in the database yet.');
      setSuccessVisible(true);
      return;
    }

    if (selectedItem.owned) {
      setPurchaseMessage('You already own this item.');
      setSuccessVisible(true);
      return;
    }

    try {
      setBuying(true);
      const result = await purchaseShopItem({
        userId: profile.userId,
        itemId: selectedItem.remoteId ?? undefined,
        clientKey: selectedItem.id,
      });

      if (result.alreadyOwned) {
        setPurchaseMessage('You already own this item.');
      } else {
        setPurchaseMessage('Item bought successfully, enjoy!');
      }

      const [inventoryRows] = await Promise.all([
        fetchShopInventory(profile.userId),
        refreshProfileStats(),
      ]);
      setOwnedItemIds(inventoryRows.map((row) => row.itemId));
    } catch (error) {
      setPurchaseMessage(error instanceof Error ? error.message : 'Purchase failed.');
    } finally {
      setBuying(false);
      setSuccessVisible(true);
    }
  };

  const changeCategory = (category: Category) => {
    const match = cosmeticItems.find((item) => item.category === category);
    if (match) {
      setSelectedItemId(match.id);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.screen}>
        {screenMode === 'shop' ? (
          <>
            <ScrollView contentContainerStyle={styles.shopContent} showsVerticalScrollIndicator={false}>
              <View style={styles.currencyRow}>
                <Image source={shopImages.coins} style={styles.coinImage} resizeMode="contain" />
                <Text style={styles.currencyText}>{profile.points}</Text>
              </View>

              {shopError ? <Text style={styles.shopStatusText}>{shopError}</Text> : null}
              {!catalogLoaded ? <Text style={styles.shopStatusText}>Loading shop items...</Text> : null}

              <Image
                source={shopImages.featuredRibbon}
                style={styles.ribbonImage}
                resizeMode="contain"
              />

              <View style={styles.bannerViewport}>
                <ScrollView
                  ref={bannerScrollRef}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={onBannerScroll}
                  contentContainerStyle={styles.bannerTrack}>
                  {banners.map((banner) => (
                    <View key={banner.id} style={styles.bannerSlide}>
                      <FeaturedCard banner={banner} />
                    </View>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.dotRow}>
                {banners.map((banner, index) => (
                  <View
                    key={banner.id}
                    style={[styles.dot, index === bannerIndex && styles.dotActive]}
                  />
                ))}
              </View>

              <View style={styles.sectionPill}>
                <Text style={styles.sectionPillText}>COSMETICS</Text>
              </View>

              <View style={styles.itemGrid}>
                {cosmeticItems.map((item) => (
                  <ItemTile
                    key={item.id}
                    item={item}
                    selected={selectedItem.id === item.id}
                    onPress={() => openConfirm(item)}
                  />
                ))}
              </View>

              <View style={styles.sectionPill}>
                <Text style={styles.sectionPillText}>ITEMS</Text>
              </View>

              <View style={styles.itemsGrid}>
                {consumableItems.map((item) => (
                  <ItemTile
                    key={item.id}
                    item={item}
                    selected={selectedItem.id === item.id}
                    onPress={() => openConfirm(item)}
                  />
                ))}
              </View>
            </ScrollView>

            <BottomNav activeIcon="bag-outline" onSelect={handleNavSelect} />
          </>
        ) : screenMode === 'wardrobe' ? (
          <>
            <WardrobeScreenContent onOpenShop={() => setScreenMode('shop')} />
            <BottomNav activeIcon="shirt-outline" onSelect={handleNavSelect} />
          </>
        ) : (
          <>
            <View style={styles.previewTop}>
              <Pressable onPress={() => setScreenMode('shop')} style={styles.previewBackButton}>
                <Text style={styles.previewBackText}>Back</Text>
              </Pressable>
            </View>

            <View style={styles.previewStage}>
              <View style={styles.previewShadow} />
              <Image source={shopImages.mascot} style={styles.previewMascot} resizeMode="contain" />
              {selectedItem.id === 'glasses' ? (
                <Image
                  source={shopImages.items.glasses}
                  style={styles.previewAccessoryGlasses}
                  resizeMode="contain"
                />
              ) : null}
              {selectedItem.id === 'cap' ? (
                <Image
                  source={shopImages.items.cap}
                  style={styles.previewAccessoryHat}
                  resizeMode="contain"
                />
              ) : null}
              {selectedItem.id === 'cute-cap' ? (
                <Image
                  source={shopImages.items['cute-cap']}
                  style={styles.previewAccessoryHat}
                  resizeMode="contain"
                />
              ) : null}
              {selectedItem.id === 'royal-crown' ? (
                <Image
                  source={shopImages.items['royal-crown']}
                  style={styles.previewAccessoryCrown}
                  resizeMode="contain"
                />
              ) : null}
              {selectedItem.id === 'tung-buddy' ? (
                <Image
                  source={shopImages.items['tung-buddy']}
                  style={styles.previewAccessoryBuddy}
                  resizeMode="contain"
                />
              ) : null}
            </View>

            <View style={styles.categoryBar}>
              {categories.map((category) => (
                <Pressable
                  key={category}
                  onPress={() => changeCategory(category)}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category && styles.categoryButtonActive,
                  ]}>
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category && styles.categoryTextActive,
                    ]}>
                    {category}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.previewInventory}>
              {previewItems.slice(0, 1).map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => setSelectedItemId(item.id)}
                  style={styles.previewInventoryCard}>
                  <Image
                    source={shopImages.items[item.id]}
                    style={styles.previewInventoryImage}
                    resizeMode="contain"
                  />
                </Pressable>
              ))}
            </View>
          </>
        )}
      </View>

      <Modal transparent animationType="fade" visible={confirmVisible} onRequestClose={handleNo}>
        <View style={styles.modalBackdrop}>
          <View style={styles.confirmModal}>
            <Pressable onPress={handleNo} style={styles.modalBackIcon}>
              <Text style={styles.modalBackText}>{'<'}</Text>
            </Pressable>

            <Text style={styles.modalTitle}>
              {selectedItem.owned
                ? 'You already own this item.'
                : selectedItem.available === false
                  ? 'This item is not linked in the database yet.'
                  : 'Are you sure you want to buy this?'}
            </Text>

            <View style={styles.modalItemCard}>
              <Image
                source={shopImages.items[selectedItem.id]}
                style={styles.modalItemImage}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.modalItemName}>{selectedItem.name}</Text>
            <PriceTag value={selectedItem.price} large />

            <View style={styles.modalActions}>
              <Pressable onPress={handleNo} style={[styles.actionButton, styles.actionNo]}>
                <Text style={[styles.actionText, styles.actionNoText]}>No</Text>
              </Pressable>
              <Pressable onPress={handlePreview} style={[styles.actionButton, styles.actionPreview]}>
                <Text style={[styles.actionText, styles.actionPreviewText]}>Preview</Text>
              </Pressable>
              <Pressable
                disabled={buying || selectedItem.owned || selectedItem.available === false}
                onPress={handleBuy}
                style={[
                  styles.actionButton,
                  styles.actionBuy,
                  (buying || selectedItem.owned || selectedItem.available === false) && styles.actionButtonDisabled,
                ]}>
                <Text style={[styles.actionText, styles.actionBuyText]}>
                  {buying ? 'Buying...' : selectedItem.owned ? 'Owned' : 'Buy'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent animationType="fade" visible={successVisible} onRequestClose={() => setSuccessVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.successModal}>
            <Text style={styles.successText}>{purchaseMessage}</Text>
            <Pressable onPress={() => setSuccessVisible(false)} style={styles.successCloseButton}>
              <Text style={styles.successCloseText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2d2d2d',
  },
  screen: {
    flex: 1,
    backgroundColor: '#2d2d2d',
  },
  shopContent: {
    paddingHorizontal: 16,
    paddingTop: 26,
    paddingBottom: 22,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 26,
  },
  coinImage: {
    width: 24,
    height: 44,
  },
  currencyText: {
    color: '#df79ff',
    fontSize: 30,
    fontWeight: '800',
  },
  ribbonImage: {
    width: '100%',
    height: 86,
    marginBottom: 8,
  },
  shopStatusText: {
    color: '#f4d7f2',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12,
  },
  bannerViewport: {
    marginTop: -6,
  },
  bannerTrack: {
    alignItems: 'center',
  },
  bannerSlide: {
    width: bannerWidth,
  },
  bannerCard: {
    width: bannerWidth,
    height: 146,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#7c280f',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerCaption: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  bannerCaptionTitle: {
    color: '#fff5f7',
    fontSize: 14,
    fontWeight: '800',
  },
  bannerCaptionMeta: {
    color: '#fff5e7',
    fontSize: 12,
    fontWeight: '700',
  },
  customBannerGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 999,
    right: -20,
    top: -26,
    opacity: 0.45,
  },
  customBannerShapes: {
    position: 'absolute',
    left: 18,
    top: 24,
  },
  customBlobLarge: {
    width: 86,
    height: 86,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.18)',
    transform: [{ rotate: '-10deg' }],
  },
  customBlobSmall: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginTop: -10,
    marginLeft: 54,
    transform: [{ rotate: '14deg' }],
  },
  customBannerEyebrow: {
    marginTop: 18,
    marginLeft: 128,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  customBannerTitle: {
    marginTop: 22,
    marginLeft: 128,
    fontSize: 26,
    fontWeight: '900',
  },
  customBannerMeta: {
    marginTop: 8,
    marginLeft: 128,
    fontSize: 13,
    fontWeight: '700',
  },
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 14,
    marginBottom: 28,
  },
  dot: {
    width: 18,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#c5c5c8',
  },
  dotActive: {
    backgroundColor: '#ff40e6',
  },
  sectionPill: {
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: '#f4d7f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  sectionPillText: {
    color: '#ef31e4',
    fontSize: 20,
    fontWeight: '900',
  },
  itemGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 18,
    marginBottom: 26,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    rowGap: 18,
    columnGap: 18,
    marginBottom: 10,
  },
  itemTile: {
    width: '31%',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 4,
  },
  itemTileSelected: {
    backgroundColor: '#3a3a3a',
  },
  itemImageCard: {
    width: 104,
    height: 102,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  itemImage: {
    width: 74,
    height: 74,
  },
  itemName: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
    minHeight: 20,
  },
  itemMetaOwned: {
    color: '#90ff56',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 2,
  },
  itemMetaUnavailable: {
    color: '#f6a5c0',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  priceCoin: {
    width: 11,
    height: 20,
  },
  priceCoinLarge: {
    width: 12,
    height: 24,
  },
  priceText: {
    color: '#d76ef6',
    fontSize: 16,
    fontWeight: '800',
  },
  priceTextLarge: {
    fontSize: 18,
  },
  previewTop: {
    paddingHorizontal: 22,
    paddingTop: 30,
    paddingBottom: 10,
  },
  previewBackButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#ef8ed6',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#fff0ff',
  },
  previewBackText: {
    color: '#fff5ff',
    fontSize: 17,
    fontWeight: '800',
  },
  previewStage: {
    height: 454,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  previewShadow: {
    position: 'absolute',
    bottom: 54,
    width: 210,
    height: 34,
    borderRadius: 999,
    backgroundColor: '#acacac',
  },
  previewMascot: {
    width: 286,
    height: 352,
    marginTop: 10,
  },
  previewAccessoryHat: {
    position: 'absolute',
    top: 90,
    width: 130,
    height: 88,
  },
  previewAccessoryGlasses: {
    position: 'absolute',
    top: 190,
    width: 120,
    height: 48,
  },
  previewAccessoryCrown: {
    position: 'absolute',
    top: 76,
    width: 138,
    height: 112,
  },
  previewAccessoryBuddy: {
    position: 'absolute',
    left: 28,
    bottom: 84,
    width: 94,
    height: 114,
  },
  categoryBar: {
    height: 58,
    backgroundColor: '#111116',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#494952',
  },
  categoryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryButtonActive: {
    borderWidth: 2,
    borderColor: '#cfd2ee',
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  previewInventory: {
    flex: 1,
    backgroundColor: '#0e0e13',
    padding: 26,
  },
  previewInventoryCard: {
    width: 82,
    height: 82,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#cbd2ff',
    backgroundColor: '#3f424f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewInventoryImage: {
    width: 52,
    height: 52,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  confirmModal: {
    width: '100%',
    maxWidth: 370,
    borderWidth: 2,
    borderColor: '#d5d5d5',
    backgroundColor: '#2d2d2d',
    paddingHorizontal: 18,
    paddingVertical: 24,
    alignItems: 'center',
  },
  modalBackIcon: {
    position: 'absolute',
    left: 16,
    top: 16,
  },
  modalBackText: {
    color: '#d575ff',
    fontSize: 26,
    fontWeight: '900',
  },
  modalTitle: {
    color: '#c86bf1',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 32,
    width: 246,
    marginBottom: 18,
  },
  modalItemCard: {
    width: 102,
    height: 102,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalItemImage: {
    width: 72,
    height: 72,
  },
  modalItemName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 14,
    marginBottom: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  },
  actionButton: {
    minWidth: 76,
    height: 42,
    borderWidth: 3,
    borderRadius: 10,
    backgroundColor: '#fff4ff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  actionNo: {
    borderColor: '#ff544d',
  },
  actionPreview: {
    borderColor: '#f27cff',
  },
  actionBuy: {
    borderColor: '#90ff56',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '800',
  },
  actionButtonDisabled: {
    opacity: 0.55,
  },
  actionNoText: {
    color: '#ff544d',
  },
  actionPreviewText: {
    color: '#cf77f2',
  },
  actionBuyText: {
    color: '#3eb100',
  },
  successModal: {
    width: '100%',
    maxWidth: 420,
    minHeight: 210,
    borderWidth: 2,
    borderColor: '#d5d5d5',
    backgroundColor: '#2d2d2d',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  successText: {
    color: '#c86bf1',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 42,
  },
  successCloseButton: {
    marginTop: 24,
    backgroundColor: '#f4d7f2',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  successCloseText: {
    color: '#c34de7',
    fontSize: 15,
    fontWeight: '800',
  },
});
