import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

const cosmetics = [
  { name: 'Sonic Shoes', price: 45 },
  { name: 'Tung Buddy', price: 80 },
  { name: 'Cap', price: 45 },
  { name: 'Cute Cap', price: 45 },
  { name: 'Glasses', price: 80 },
  { name: 'Royal Crown', price: 100 },
];

function PlaceholderImage({ label }: { label: string }) {
  return React.createElement(
    View,
    { style: styles.placeholderImage },
    React.createElement(Text, { style: styles.placeholderText }, label)
  );
}

export default function ShopPage() {
  return React.createElement(
    SafeAreaView,
    { style: styles.safeArea },
    React.createElement(
      View,
      { style: styles.screen },
      React.createElement(
        ScrollView,
        { contentContainerStyle: styles.content, showsVerticalScrollIndicator: false },
        React.createElement(
          View,
          { style: styles.currencyRow },
          React.createElement(Text, { style: styles.gemIcon }, '♦'),
          React.createElement(Text, { style: styles.currencyText }, '500')
        ),

        React.createElement(
          View,
          { style: styles.featuredWrap },
          React.createElement(
            View,
            { style: styles.ribbonRow },
            React.createElement(View, { style: styles.ribbonEndLeft }),
            React.createElement(
              View,
              { style: styles.ribbonCenter },
              React.createElement(Text, { style: styles.ribbonText }, 'FEATURED')
            ),
            React.createElement(View, { style: styles.ribbonEndRight })
          ),

          React.createElement(
            View,
            { style: styles.bannerCard },
            React.createElement(PlaceholderImage, { label: 'FEATURED BANNER PLACEHOLDER' }),
            React.createElement(
              View,
              { style: styles.bannerOverlay },
              React.createElement(Text, { style: styles.bannerTitle }, 'Limited Set: Godzilla'),
              React.createElement(Text, { style: styles.bannerEnds }, 'Ends 6/7')
            )
          ),

          React.createElement(
            View,
            { style: styles.carouselDots },
            React.createElement(View, { style: [styles.dot, styles.dotActive] }),
            React.createElement(View, { style: styles.dot }),
            React.createElement(View, { style: styles.dot })
          )
        ),

        React.createElement(
          View,
          { style: styles.sectionPill },
          React.createElement(Text, { style: styles.sectionPillText }, 'COSMETICS')
        ),

        React.createElement(
          View,
          { style: styles.grid },
          cosmetics.map((item) =>
            React.createElement(
              View,
              { key: item.name, style: styles.productCard },
              React.createElement(PlaceholderImage, { label: 'IMG' }),
              React.createElement(Text, { style: styles.productName }, item.name),
              React.createElement(
                View,
                { style: styles.priceRow },
                React.createElement(Text, { style: styles.priceGem }, '♦'),
                React.createElement(Text, { style: styles.priceText }, String(item.price))
              )
            )
          )
        ),

        React.createElement(
          View,
          { style: styles.sectionPill },
          React.createElement(Text, { style: styles.sectionPillText }, 'ITEMS')
        )
      ),

      React.createElement(
        View,
        { style: styles.bottomNav },
        React.createElement(Text, { style: styles.navIcon }, '⌂'),
        React.createElement(Text, { style: styles.navIcon }, '⌁'),
        React.createElement(
          View,
          { style: styles.centerNavWrap },
          React.createElement(Text, { style: styles.centerNavIcon }, '▮▮▮')
        ),
        React.createElement(Text, { style: styles.navIcon }, '◙'),
        React.createElement(Text, { style: styles.navIcon }, '⌄')
      )
    )
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1f1f24',
  },
  screen: {
    flex: 1,
    backgroundColor: '#2a2a30',
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 0,
  },
  content: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 18,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 10,
    paddingLeft: 2,
  },
  gemIcon: {
    color: '#ed72ff',
    fontSize: 21,
    lineHeight: 22,
  },
  currencyText: {
    color: '#d76ae8',
    fontSize: 31,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  featuredWrap: {
    alignItems: 'center',
    marginBottom: 14,
  },
  ribbonRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -6,
    zIndex: 2,
  },
  ribbonEndLeft: {
    width: 20,
    height: 22,
    backgroundColor: '#f1c3d2',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    transform: [{ skewY: '10deg' }],
  },
  ribbonCenter: {
    backgroundColor: '#f8dce6',
    paddingHorizontal: 26,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d7afb9',
  },
  ribbonText: {
    color: '#3f373b',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 1,
    textShadowColor: '#ffffff',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  ribbonEndRight: {
    width: 20,
    height: 22,
    backgroundColor: '#f1c3d2',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    transform: [{ skewY: '-10deg' }],
  },
  bannerCard: {
    width: '100%',
    height: 105,
    borderRadius: 9,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#31180f',
    backgroundColor: '#7a3a27',
  },
  placeholderImage: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#5b5b64',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#d5d5da',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  bannerOverlay: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerTitle: {
    color: '#fff3f5',
    fontSize: 23,
    fontWeight: '800',
  },
  bannerEnds: {
    color: '#fff3f5',
    fontSize: 14,
    fontWeight: '700',
  },
  carouselDots: {
    marginTop: 9,
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 18,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d6d6dc',
    opacity: 0.8,
  },
  dotActive: {
    backgroundColor: '#f164ea',
  },
  sectionPill: {
    marginTop: 2,
    marginBottom: 12,
    backgroundColor: '#ecd4ea',
    borderRadius: 7,
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionPillText: {
    color: '#cf35cc',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 11,
    marginBottom: 12,
  },
  productCard: {
    width: '31%',
    alignItems: 'center',
  },
  productName: {
    color: '#f5f5f8',
    fontSize: 25,
    fontWeight: '700',
    marginTop: 5,
    textAlign: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  priceGem: {
    color: '#e861f6',
    fontSize: 15,
    lineHeight: 16,
  },
  priceText: {
    color: '#e861f6',
    fontSize: 25,
    fontWeight: '800',
  },
  bottomNav: {
    height: 52,
    backgroundColor: '#cd2fb6',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 2,
  },
  navIcon: {
    color: '#1a1420',
    fontSize: 22,
    fontWeight: '700',
  },
  centerNavWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#eec4ed',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -15,
  },
  centerNavIcon: {
    color: '#2a2030',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
