import React, { useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

type ShopItemId =
  | 'sonic-shoes'
  | 'tung-buddy'
  | 'cap'
  | 'cute-cap'
  | 'glasses'
  | 'royal-crown'
  | 'brainfreeze';

type Category = 'Hair' | 'Hats' | 'Face' | 'Color' | 'Shoes';
type ScreenMode = 'shop' | 'preview';
type NavKey = 'home' | 'social' | 'leaderboard' | 'shop' | 'preview';

type ShopItem = {
  id: ShopItemId;
  name: string;
  price: number;
  category: Category;
  section: 'cosmetics' | 'items';
};

const windowWidth = Dimensions.get('window').width;
const bannerWidth = Math.min(windowWidth - 48, 390);

const shopImages = {
  coins: require('../../assets/images/shop/Coins.png'),
  featuredRibbon: require('../../assets/images/shop/Featured.png'),
  featuredBanner: require('../../assets/images/shop/LimitedSetGodzilla.png'),
  mascot: require('../../assets/images/shop/Mascot.png'),
  nav: {
    home: require('../../assets/images/shop/Home.png'),
    social: require('../../assets/images/shop/Social.png'),
    preview: require('../../assets/images/shop/Preview.png'),
  },
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

function NavIcon({ name, active }: { name: NavKey; active: boolean }) {
  const color = active ? '#141018' : '#1e1523';

  if (name === 'home') {
    return (
      <Image source={shopImages.nav.home} style={styles.bottomNavImage} resizeMode="contain" />
    );
  }

  if (name === 'social') {
    return (
      <Image
        source={shopImages.nav.social}
        style={styles.bottomNavImage}
        resizeMode="contain"
      />
    );
  }

  if (name === 'leaderboard') {
    return (
      <View style={styles.iconBox}>
        <View style={[styles.rankBarShort, { backgroundColor: color }]} />
        <View style={[styles.rankBarTall, { backgroundColor: color }]} />
        <View style={[styles.rankBarMid, { backgroundColor: color }]} />
      </View>
    );
  }

  if (name === 'shop') {
    return (
      <View style={[styles.shopIconWrap, active && styles.shopIconWrapActive]}>
        <View style={[styles.bagHandle, { borderColor: color }]} />
        <View style={[styles.bagBody, { borderColor: color }]}>
          <View style={[styles.bagPocket, { borderColor: color }]} />
        </View>
      </View>
    );
  }

  return <Image source={shopImages.nav.preview} style={styles.bottomNavImage} resizeMode="contain" />;
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

export default function ShopPage() {
  const router = useRouter();
  const [coins, setCoins] = useState(500);
  const [selectedItem, setSelectedItem] = useState<ShopItem>(cosmetics[0]);
  const [screenMode, setScreenMode] = useState<ScreenMode>('shop');
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [lastPurchaseSucceeded, setLastPurchaseSucceeded] = useState(true);
  const [bannerIndex, setBannerIndex] = useState(0);
  const bannerScrollRef = useRef<ScrollView | null>(null);

  const activeNav = useMemo<NavKey>(() => {
    return screenMode === 'preview' ? 'preview' : 'shop';
  }, [screenMode]);

  const selectedCategory = selectedItem.category;
  const previewItems = [...cosmetics, ...items].filter((item) => item.category === selectedCategory);

  const onBannerScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const nextIndex = Math.round(offsetX / bannerWidth);
    if (nextIndex !== bannerIndex) {
      setBannerIndex(nextIndex);
    }
  };

  const openConfirm = (item: ShopItem) => {
    setSelectedItem(item);
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

  const handleBuy = () => {
    setConfirmVisible(false);
    if (coins >= selectedItem.price) {
      setCoins((current) => current - selectedItem.price);
      setLastPurchaseSucceeded(true);
      setSuccessVisible(true);
      return;
    }
    setLastPurchaseSucceeded(false);
    setSuccessVisible(true);
  };

  const changeCategory = (category: Category) => {
    const match = cosmetics.find((item) => item.category === category);
    if (match) {
      setSelectedItem(match);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        {screenMode === 'shop' ? (
          <>
            <ScrollView contentContainerStyle={styles.shopContent} showsVerticalScrollIndicator={false}>
              <View style={styles.currencyRow}>
                <Image source={shopImages.coins} style={styles.coinImage} resizeMode="contain" />
                <Text style={styles.currencyText}>{coins}</Text>
              </View>

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
                {cosmetics.map((item) => (
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
                {items.map((item) => (
                  <ItemTile
                    key={item.id}
                    item={item}
                    selected={selectedItem.id === item.id}
                    onPress={() => openConfirm(item)}
                  />
                ))}
              </View>
            </ScrollView>

            <View style={styles.bottomBar}>
              {(['home', 'social', 'leaderboard', 'shop', 'preview'] as NavKey[]).map((key) => (
                <Pressable
                  key={key}
                  onPress={() => {
                    if (key === 'leaderboard') {
                      router.replace('/RewardsPage');
                      return;
                    }
                    if (key === 'preview') {
                      setScreenMode('preview');
                    } else if (key === 'shop') {
                      setScreenMode('shop');
                    }
                  }}
                  style={styles.navButton}>
                  <NavIcon name={key} active={activeNav === key || key === 'leaderboard'} />
                </Pressable>
              ))}
            </View>
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
                  onPress={() => setSelectedItem(item)}
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

            <Text style={styles.modalTitle}>Are you sure you want to buy this?</Text>

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
              <Pressable onPress={handleBuy} style={[styles.actionButton, styles.actionBuy]}>
                <Text style={[styles.actionText, styles.actionBuyText]}>Buy</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent animationType="fade" visible={successVisible} onRequestClose={() => setSuccessVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.successModal}>
            <Text style={styles.successText}>
              {lastPurchaseSucceeded
                ? 'Item bought successfully, enjoy!'
                : 'Not enough gems for this item.'}
            </Text>
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
    backgroundColor: '#6b6b6b',
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
    minHeight: 38,
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
  bottomBar: {
    height: 54,
    backgroundColor: '#db39d8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNavImage: {
    width: 24,
    height: 24,
    tintColor: '#1e1523',
  },
  rankBarShort: {
    width: 6,
    height: 15,
    position: 'absolute',
    left: 6,
    bottom: 7,
  },
  rankBarTall: {
    width: 6,
    height: 22,
    position: 'absolute',
    left: 14,
    bottom: 7,
  },
  rankBarMid: {
    width: 6,
    height: 18,
    position: 'absolute',
    right: 6,
    bottom: 7,
  },
  shopIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopIconWrapActive: {
    backgroundColor: '#ffe8ff',
  },
  bagHandle: {
    width: 12,
    height: 7,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    marginBottom: -1,
  },
  bagBody: {
    width: 15,
    height: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bagPocket: {
    width: 6,
    height: 5,
    borderWidth: 2,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomWidth: 0,
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
