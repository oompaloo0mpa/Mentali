import React from 'react';
import { StyleSheet, View } from 'react-native';

type OnboardingProgressDotsProps = {
  activeIndex: number;
};

export default function OnboardingProgressDots({ activeIndex }: OnboardingProgressDotsProps): React.ReactElement {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: 5 }).map((_, index) => (
        <View
          key={index}
          style={[styles.dot, index === activeIndex ? styles.dotActive : styles.dotInactive]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  dot: {
    height: 3,
    borderRadius: 2,
  },
  dotInactive: {
    width: 11,
    backgroundColor: '#BDB7BE',
  },
  dotActive: {
    width: 13,
    backgroundColor: '#222222',
  },
});