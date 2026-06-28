import React, { useState } from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type ShopItemId =
  | 'sonic-shoes'
  | 'tung-buddy'
  | 'cap'
  | 'cute-cap'
  | 'glasses'
  | 'royal-crown';

type ShopItem = {
  id: ShopItemId;
  name: string;
  price: number;
  category: 'Hair' | 'Hats' | 'Face' | 'Color' | 'Shoes';
};

const cosmetics: ShopItem[] = [
  { id: 'sonic-shoes', name: 'Sonic Shoes', price: 45, category: 'Shoes' },
  { id: 'tung-buddy', name: 'Tung Buddy', price: 80, category: 'Hats' },
  { id: 'cap', name: 'Cap', price: 45, category: 'Hats' },
  { id: 'cute-cap', name: 'Cute Cap', price: 45, category: 'Hats' },
  { id: 'glasses', name: 'Glasses', price: 80, category: 'Face' },
  { id: 'royal-crown', name: 'Royal Crown', price: 1000, category: 'Hats' },
];

const categories: ShopItem['category'][] = ['Hair', 'Hats', 'Face', 'Color', 'Shoes'];

const shopImages = {
  coins: require('../../assets/images/shop/Coins.png'),
  featuredRibbon: require('../../assets/images/shop/Featured.png'),
  featuredBanner: require('../../assets/images/shop/LimitedSetGodzilla.png'),
  mascot: require('../../assets/images/shop/Mascot.png'),
  items: {
    'sonic-shoes': require('../../assets/images/shop/SonicShoes.png'),
    'tung-buddy': require('../../assets/images/shop/Tung Buddy.png'),
    cap: require('../../assets/images/shop/Cap.png'),
    'cute-cap': require('../../assets/images/shop/CuteCap.png'),
    glasses: require('../../assets/images/shop/Glasses.png'),
    'royal-crown': require('../../assets/images/shop/RoyalCrown.png'),
  } as const,
};

function PriceTag({ value, large = false }: { value: number; large?: boolean }) {
  return (
    <View style={styles.priceRow}>
      <View style={[styles.gemIcon, large && styles.gemIconLarge]} />
      <Text style={[styles.priceText, large && styles.largePriceText]}>{value}</Text>
    </View>
  );
}

function GemCountIcon() {
  return <Image source={shopImages.coins} style={styles.gemCountIcon} resizeMode="contain" />;
}

function ItemArt({ item, large = false }: { item: ShopItem; large?: boolean }) {
  return (
    <View style={[styles.itemArtFrame, large && styles.itemArtFrameLarge]}>
      <Image
        source={shopImages.items[item.id]}
        style={[styles.itemImage, large && styles.itemImageLarge]}
        resizeMode="contain"
      />
    </View>
  );
}

function FeaturedBanner() {
  return (
    <View style={styles.bannerCard}>
      <Image source={shopImages.featuredBanner} style={styles.bannerImage} resizeMode="cover" />
    </View>
  );
}

function BrainPreview({ item }: { item: ShopItem }) {
  return (
    <View style={styles.previewStage}>
      <View style={styles.shadowOval} />
      <Image source={shopImages.mascot} style={styles.mascotImage} resizeMode="contain" />
      {item.id === 'glasses' ? (
        <Image source={shopImages.items.glasses} style={styles.previewGlasses} resizeMode="contain" />
      ) : null}
      {item.id === 'cap' ? (
        <Image source={shopImages.items.cap} style={styles.previewHat} resizeMode="contain" />
      ) : null}
      {item.id === 'cute-cap' ? (
        <Image source={shopImages.items['cute-cap']} style={styles.previewHat} resizeMode="contain" />
      ) : null}
      {item.id === 'royal-crown' ? (
        <Image
          source={shopImages.items['royal-crown']}
          style={styles.previewCrown}
          resizeMode="contain"
        />
      ) : null}
      {item.id === 'tung-buddy' ? (
        <Image
          source={shopImages.items['tung-buddy']}
          style={styles.previewBuddy}
          resizeMode="contain"
        />
      ) : null}
    </View>
  );
}

export default function ShopPage() {
  const [coins, setCoins] = useState(500);
  const [selectedItem, setSelectedItem] = useState<ShopItem>(cosmetics[0]);
  const [confirmingPurchase, setConfirmingPurchase] = useState(false);
  const [purchaseMessage, setPurchaseMessage] = useState('');

  const handleSelectItem = (item: ShopItem) => {
    setSelectedItem(item);
    setConfirmingPurchase(false);
    setPurchaseMessage('');
  };

  const handleBuy = () => {
    if (coins < selectedItem.price) {
      setPurchaseMessage('Not enough gems for this item.');
      setConfirmingPurchase(false);
      return;
    }

    setCoins((current) => current - selectedItem.price);
    setConfirmingPurchase(false);
    setPurchaseMessage('Item bought successfully, enjoy!');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.pageContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.stage}>
          <View style={styles.phoneShell}>
            <View style={styles.shopCard}>
              <View style={styles.currencyRow}>
                <GemCountIcon />
                <Text style={styles.currencyText}>{coins}</Text>
              </View>

              <View style={styles.featuredWrap}>
                <Image
                  source={shopImages.featuredRibbon}
                  style={styles.ribbonImage}
                  resizeMode="contain"
                />

                <FeaturedBanner />

                <View style={styles.carouselDots}>
                  <View style={[styles.dot, styles.dotActive]} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                </View>
              </View>

              <View style={styles.sectionPill}>
                <Text style={styles.sectionPillText}>COSMETICS</Text>
              </View>

              <View style={styles.grid}>
                {cosmetics.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => handleSelectItem(item)}
                    style={[styles.productCard, selectedItem.id === item.id && styles.productCardActive]}>
                    <ItemArt item={item} />
                    <Text style={styles.productName}>{item.name}</Text>
                    <PriceTag value={item.price} />
                  </Pressable>
                ))}
              </View>

              <View style={styles.sectionPill}>
                <Text style={styles.sectionPillText}>ITEMS</Text>
              </View>
            </View>

            <View style={styles.bottomNav}>
              <Text style={styles.navLabel}>Home</Text>
              <Text style={styles.navLabel}>Social</Text>
              <View style={styles.centerNavWrap}>
                <Text style={styles.centerNavText}>Shop</Text>
              </View>
              <Text style={styles.navLabel}>Bag</Text>
              <Text style={styles.navLabel}>Me</Text>
            </View>
          </View>

          <View style={styles.centerColumn}>
            <Text style={styles.centerLabel}>Purchase confirmation overlay</Text>
            <View style={styles.confirmCard}>
              <Pressable
                onPress={() => setConfirmingPurchase(false)}
                style={styles.confirmBackButton}>
                <Text style={styles.confirmBackText}>{'<'}</Text>
              </Pressable>

              <Text style={styles.confirmTitle}>Are you sure you want to buy this?</Text>

              <ItemArt item={selectedItem} />

              <Text style={styles.confirmItemName}>{selectedItem.name}</Text>
              <PriceTag value={selectedItem.price} large />

              <View style={styles.confirmActions}>
                <Pressable
                  onPress={() => setConfirmingPurchase(false)}
                  style={[styles.actionButton, styles.actionButtonNo]}>
                  <Text style={[styles.actionButtonText, styles.actionButtonNoText]}>No</Text>
                </Pressable>

                <Pressable
                  onPress={() => setConfirmingPurchase(true)}
                  style={[styles.actionButton, styles.actionButtonPreview]}>
                  <Text style={[styles.actionButtonText, styles.actionButtonPreviewText]}>
                    Preview
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleBuy}
                  style={[styles.actionButton, styles.actionButtonBuy]}>
                  <Text style={[styles.actionButtonText, styles.actionButtonBuyText]}>Buy</Text>
                </Pressable>
              </View>
            </View>

            <Text style={styles.centerLabel}>Purchase successful message</Text>
            <View style={styles.successCard}>
              <Text style={styles.successText}>
                {purchaseMessage || 'Item bought successfully, enjoy!'}
              </Text>
            </View>
          </View>

          <View style={styles.phoneShell}>
            <View style={styles.previewCard}>
              <Pressable style={styles.backButton}>
                <Text style={styles.backButtonText}>Back</Text>
              </Pressable>

              <BrainPreview item={selectedItem} />

              <View style={styles.categoryTabs}>
                {categories.map((category) => (
                  <Pressable
                    key={category}
                    onPress={() => {
                      const match = cosmetics.find((item) => item.category === category);
                      if (match) {
                        handleSelectItem(match);
                      }
                    }}
                    style={[
                      styles.categoryTab,
                      selectedItem.category === category && styles.categoryTabActive,
                    ]}>
                    <Text
                      style={[
                        styles.categoryTabText,
                        selectedItem.category === category && styles.categoryTabTextActive,
                      ]}>
                      {category}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.previewInventory}>
                <Pressable style={styles.previewSelectionCard}>
                  <ItemArt item={selectedItem} />
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {confirmingPurchase ? (
          <View style={styles.inlineHint}>
            <Text style={styles.inlineHintText}>
              Preview active. Use Buy to confirm the selected cosmetic.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#999999',
  },
  pageContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 28,
    alignItems: 'center',
  },
  stage: {
    width: '100%',
    maxWidth: 1240,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 48,
  },
  phoneShell: {
    width: 356,
  },
  shopCard: {
    minHeight: 730,
    backgroundColor: '#4a4a4a',
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 16,
  },
  previewCard: {
    minHeight: 730,
    backgroundColor: '#444444',
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 16,
  },
  centerColumn: {
    width: 320,
    justifyContent: 'center',
    paddingVertical: 64,
  },
  centerLabel: {
    color: '#faf5f8',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 22,
  },
  gemCountIcon: {
    width: 18,
    height: 36,
  },
  currencyText: {
    color: '#f3a0ff',
    fontSize: 35,
    fontWeight: '800',
  },
  featuredWrap: {
    alignItems: 'center',
    marginBottom: 20,
  },
  ribbonImage: {
    width: 286,
    height: 82,
    marginBottom: 10,
  },
  bannerCard: {
    width: '100%',
    height: 112,
    borderRadius: 13,
    overflow: 'hidden',
    backgroundColor: '#7c230c',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  carouselDots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  dot: {
    width: 18,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#cfcfcf',
  },
  dotActive: {
    backgroundColor: '#f156f2',
  },
  sectionPill: {
    backgroundColor: '#f8f5f7',
    borderRadius: 9,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  sectionPillText: {
    color: '#ff39f4',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
    marginBottom: 18,
  },
  productCard: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  productCardActive: {
    borderColor: '#f0b1ff',
    backgroundColor: '#575757',
  },
  itemArtFrame: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  itemArtFrameLarge: {
    width: 88,
    height: 88,
  },
  itemImage: {
    width: 64,
    height: 64,
  },
  itemImageLarge: {
    width: 72,
    height: 72,
  },
  productName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 6,
    minHeight: 34,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  gemIcon: {
    width: 9,
    height: 9,
    backgroundColor: '#f2a1ff',
    transform: [{ rotate: '45deg' }],
    borderRadius: 1,
  },
  gemIconLarge: {
    width: 11,
    height: 11,
  },
  priceText: {
    color: '#f2a1ff',
    fontSize: 15,
    fontWeight: '800',
  },
  largePriceText: {
    fontSize: 16,
  },
  bottomNav: {
    height: 40,
    backgroundColor: '#f148ef',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  centerNavWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#fff8fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
  },
  navLabel: {
    color: '#231828',
    fontSize: 11,
    fontWeight: '800',
  },
  centerNavText: {
    color: '#231828',
    fontSize: 10,
    fontWeight: '900',
  },
  confirmCard: {
    borderWidth: 2,
    borderColor: '#ececec',
    backgroundColor: '#4b4b4b',
    paddingVertical: 16,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginBottom: 18,
    minHeight: 274,
  },
  confirmBackButton: {
    position: 'absolute',
    left: 10,
    top: 12,
  },
  confirmBackText: {
    color: '#eb95ff',
    fontSize: 22,
    fontWeight: '900',
  },
  confirmTitle: {
    color: '#f0a4ff',
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    width: 180,
    lineHeight: 28,
    marginTop: 4,
    marginBottom: 12,
  },
  confirmItemName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 10,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 18,
    marginTop: 24,
  },
  actionButton: {
    minWidth: 58,
    height: 36,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    backgroundColor: '#ffffff',
  },
  actionButtonNo: {
    borderColor: '#ff5f55',
  },
  actionButtonPreview: {
    borderColor: '#f079ff',
  },
  actionButtonBuy: {
    borderColor: '#7ef338',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  actionButtonNoText: {
    color: '#ff5f55',
  },
  actionButtonPreviewText: {
    color: '#f079ff',
  },
  actionButtonBuyText: {
    color: '#33be00',
  },
  successCard: {
    borderWidth: 2,
    borderColor: '#ececec',
    backgroundColor: '#4b4b4b',
    minHeight: 166,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  successText: {
    color: '#f0a4ff',
    fontSize: 23,
    fontWeight: '800',
    lineHeight: 38,
    textAlign: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#f9f2f7',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },
  backButtonText: {
    color: '#f6e6f4',
    fontSize: 16,
    fontWeight: '900',
  },
  previewStage: {
    height: 346,
    position: 'relative',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 14,
  },
  shadowOval: {
    position: 'absolute',
    bottom: 24,
    width: 212,
    height: 28,
    borderRadius: 999,
    backgroundColor: '#d9d9d9',
  },
  mascotImage: {
    width: 242,
    height: 302,
    position: 'absolute',
    top: 8,
  },
  previewHat: {
    position: 'absolute',
    top: 26,
    width: 118,
    height: 82,
  },
  previewGlasses: {
    position: 'absolute',
    top: 118,
    width: 114,
    height: 44,
  },
  previewCrown: {
    position: 'absolute',
    top: 12,
    width: 130,
    height: 106,
  },
  previewBuddy: {
    position: 'absolute',
    left: 8,
    bottom: 36,
    width: 92,
    height: 112,
  },
  categoryTabs: {
    flexDirection: 'row',
    borderTopWidth: 2,
    borderTopColor: '#777777',
    marginHorizontal: -18,
  },
  categoryTab: {
    flex: 1,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#555555',
  },
  categoryTabActive: {
    borderWidth: 2,
    borderColor: '#e9edf2',
    marginTop: -2,
  },
  categoryTabText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  categoryTabTextActive: {
    color: '#ffffff',
  },
  previewInventory: {
    minHeight: 180,
    backgroundColor: '#252529',
    marginHorizontal: -18,
    padding: 20,
  },
  previewSelectionCard: {
    width: 68,
    padding: 4,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#f0f0ff',
    backgroundColor: '#4f4f57',
  },
  inlineHint: {
    marginTop: 22,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#4d4d4d',
  },
  inlineHintText: {
    color: '#f7c3ff',
    fontSize: 14,
    fontWeight: '700',
  },
});
