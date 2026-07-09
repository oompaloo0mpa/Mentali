import React from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type NonAnonymousWarningPageProps = {
  onConfirm?: () => void;
  onCancel?: () => void;
};

export default function NonAnonymousWarningPage({
  onConfirm,
  onCancel,
}: NonAnonymousWarningPageProps): React.ReactElement {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.topSection}>
          <Text style={styles.title}>
            Before We{"\n"}
            <Text style={styles.titleAccent}>Continue...</Text>
          </Text>

          <Text style={styles.bodyText}>
            Turning off anonymous mode allows you{"\n"}
            and others to view each other&apos;s profiles{"\n"}
            and may also enable you to receive help{"\n"}
            from professionals.
          </Text>

          <Text style={styles.questionText}>ARE YOU OK WITH YOUR CHOICE?</Text>
        </View>

        <View style={styles.imageWrap}>
          <Image
            source={require('../components/WarningPageImage.png')}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.confirmButton} activeOpacity={0.85} onPress={onConfirm}>
            <Text style={styles.confirmButtonText}>YES</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} activeOpacity={0.75} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>ON SECOND THOUGHT...</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B4A8C',
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 14,
    justifyContent: 'space-between',
  },
  topSection: {
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  titleAccent: {
    color: '#DFAEE8',
  },
  bodyText: {
    marginTop: 14,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
  },
  questionText: {
    marginTop: 15,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  imageWrap: {
    flexGrow: 1,
    flexShrink: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 170,
    maxHeight: 290,
    marginTop: 10,
  },
  image: {
    width: '88%',
    height: '100%',
    maxWidth: 290,
  },
  bottomSection: {
    marginTop: 10,
  },
  confirmButton: {
    width: '100%',
    height: 48,
    borderRadius: 8,
    backgroundColor: '#DE9BE0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6A3A67',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 0,
    elevation: 3,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  cancelButton: {
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 24,
  },
  cancelButtonText: {
    color: '#DCC9DB',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
});
