import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

import type { SocialAuthResult } from "../hooks/useSocialAuth";

type SignedInPageProps = {
  session: SocialAuthResult;
  onSignOut: () => void;
};

export default function SignedInPage({ session, onSignOut }: SignedInPageProps) {
  const providerLabel = session.provider === "google" ? "Google" : "Apple";

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.title}>Signed In</Text>
        <Text style={styles.subtitle}>You are now signed in with {providerLabel}.</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Provider</Text>
          <Text style={styles.cardValue}>{providerLabel}</Text>

          <Text style={styles.cardLabel}>Account</Text>
          <Text style={styles.cardValue}>{session.email ?? session.fullName ?? "Connected successfully"}</Text>
        </View>

        <Pressable onPress={onSignOut} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
          <Text style={styles.buttonText}>SIGN OUT</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FBEAF4",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#111111",
    fontSize: 36,
    lineHeight: 40,
    fontWeight: "700",
    fontFamily: "Nunito",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 12,
    color: "#111111",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
    fontFamily: "Nunito",
    textAlign: "center",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    marginTop: 28,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: "#D8D1D8",
  },
  cardLabel: {
    color: "#6B6B6B",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    fontFamily: "Nunito",
    marginTop: 12,
  },
  cardValue: {
    color: "#111111",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
    fontFamily: "Nunito",
    marginTop: 4,
  },
  button: {
    width: "100%",
    maxWidth: 420,
    marginTop: 28,
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: "#EE91E0",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 6,
    borderBottomColor: "#C664B9",
  },
  buttonPressed: {
    transform: [{ translateY: 2 }],
    borderBottomWidth: 3,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Nunito",
  },
});