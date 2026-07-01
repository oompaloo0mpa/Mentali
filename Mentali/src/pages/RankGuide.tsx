import React, { useEffect, useRef } from 'react';
import {
	Animated,
	Easing,
	Image,
	ImageSourcePropType,
	Pressable,
	SafeAreaView,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

const rankGuideTopSource: ImageSourcePropType = require('../components/RankGuideImage_1.png');
const rankGuideMiddleSource: ImageSourcePropType = require('../components/RankGuideImage_2.png');
const rankGuideBottomSource: ImageSourcePropType = require('../components/RankGuideImage_3.png');

export default function RankGuide() {
	const router = useRouter();
	const topAnim = useRef(new Animated.Value(0)).current;
	const middleAnim = useRef(new Animated.Value(0)).current;
	const bottomAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		const createInAnimation = (value: Animated.Value, delay: number) =>
			Animated.timing(value, {
				toValue: 1,
				duration: 520,
				delay,
				easing: Easing.out(Easing.back(1.5)),
				useNativeDriver: true,
			});

		Animated.parallel([
			createInAnimation(topAnim, 0),
			createInAnimation(middleAnim, 180),
			createInAnimation(bottomAnim, 360),
		]).start();
	}, [bottomAnim, middleAnim, topAnim]);

	const topStyle = {
		opacity: topAnim,
		transform: [
			{
				translateY: topAnim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }),
			},
			{
				scale: topAnim.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] }),
			},
		],
	};

	const middleStyle = {
		opacity: middleAnim,
		transform: [
			{
				translateY: middleAnim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }),
			},
			{
				scale: middleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] }),
			},
		],
	};

	const bottomStyle = {
		opacity: bottomAnim,
		transform: [
			{
				translateY: bottomAnim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }),
			},
			{
				scale: bottomAnim.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] }),
			},
		],
	};

	return (
		<SafeAreaView style={styles.screen}>
			<StatusBar style="light" />

			<View style={styles.card}>
				<Text style={styles.title}>RANK SYSTEM</Text>

				<Animated.View style={[styles.section, topStyle]}>
					<Image source={rankGuideTopSource} style={styles.topImage} resizeMode="contain" />
					<Text style={styles.caption}>Complete quests and keep a constant{'\n'}streak!</Text>
				</Animated.View>

				<Text style={styles.arrow}>↓</Text>

				<Animated.View style={[styles.section, middleStyle]}>
					<Image source={rankGuideMiddleSource} style={styles.middleImage} resizeMode="contain" />
					<Text style={styles.caption}>Earn points and climb up the ranks!</Text>
				</Animated.View>

				<Text style={styles.arrow}>↓</Text>

				<Animated.View style={[styles.section, bottomStyle]}>
					<Image source={rankGuideBottomSource} style={styles.bottomImage} resizeMode="contain" />
					<Text style={styles.caption}>Hit certain ranks to obtain limited{'\n'}cosmetics and titles!</Text>
				</Animated.View>

				<Pressable
					accessibilityRole="button"
					accessibilityLabel="Close rank guide"
					onPress={() => router.replace('/LeaderboardPage')}
					style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}>
					<Text style={styles.closeButtonText}>CLOSE</Text>
				</Pressable>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: '#202020',
		alignItems: 'stretch',
	},
	card: {
		flex: 1,
		width: '100%',
		maxWidth: '100%',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingTop: 28,
		paddingBottom: 28,
		paddingHorizontal: 24,
		backgroundColor: '#2b2b2b',
	},
	title: {
		color: '#ffffff',
		fontSize: 24,
		fontWeight: '900',
		letterSpacing: 0.6,
		marginBottom: 14,
	},
	section: {
		width: '100%',
		alignItems: 'center',
		flexGrow: 1,
		justifyContent: 'center',
	},
	topImage: {
		width: 168,
		height: 112,
		marginBottom: 8,
	},
	middleImage: {
		width: 172,
		height: 98,
		marginBottom: 8,
	},
	bottomImage: {
		width: 178,
		height: 84,
		marginBottom: 8,
	},
	caption: {
		color: '#ffffff',
		fontSize: 12,
		fontWeight: '700',
		lineHeight: 16,
		textAlign: 'center',
		marginBottom: 4,
	},
	arrow: {
		color: '#ffffff',
		fontSize: 34,
		fontWeight: '300',
		marginVertical: 4,
	},
	closeButton: {
		marginTop: 16,
		minWidth: 120,
		height: 36,
		borderRadius: 7,
		backgroundColor: '#f48bd0',
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 2,
		borderColor: '#ffffff',
	},
	closeButtonPressed: {
		opacity: 0.9,
	},
	closeButtonText: {
		color: '#ffffff',
		fontSize: 16,
		fontWeight: '900',
		letterSpacing: 0.4,
	},
});
