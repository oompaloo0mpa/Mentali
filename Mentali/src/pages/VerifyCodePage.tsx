import { useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { isValidVerificationCode } from "../utils/authValidation";

const mascotSource = require("../../assets/images/LoginMascot.png");

type VerifyCodePageProps = {
  mode: "phone" | "email";
  onNextPress: () => void;
  onBackPress: () => void;
};

function Mascot() {
  return (
    <View style={styles.mascotWrap}>
      <Image source={mascotSource} resizeMode="contain" style={styles.mascotImage} />
    </View>
  );
}

export default function VerifyCodePage({ mode, onNextPress, onBackPress }: VerifyCodePageProps) {
  const inputRef = useRef<TextInput>(null);
  const [code, setCode] = useState("");
  const [touched, setTouched] = useState(false);

  const errorText = code.length > 0 && !isValidVerificationCode(code) ? "Enter the 6-digit code." : "";
  const isCodeValid = isValidVerificationCode(code);

  const handleChangeCode = (text: string) => {
    setCode(text.replace(/\D/g, "").slice(0, 6));
  };

  const handleNextPress = () => {
    setTouched(true);
    if (errorText || code.length !== 6) {
      return;
    }

    onNextPress();
  };

  const subtitle =
    mode === "phone"
      ? "Enter the 6-digit code sent to your phone via SMS"
      : "Enter the 6 digit code sent to the email to change your password";

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flexFill} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={styles.page}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={onBackPress}
              style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}
            >
              <Text style={styles.backButtonText}>‹</Text>
            </Pressable>

            <Mascot />

            <Text style={styles.title}>Forget Password</Text>

            <Text style={styles.subtitle}>{subtitle}</Text>

            <Pressable
              onPress={() => inputRef.current?.focus()}
              style={styles.codeRow}
              accessibilityRole="button"
              accessibilityLabel="Enter verification code"
            >
              {Array.from({ length: 6 }).map((_, index) => (
                <View key={`code-slot-${index}`} style={styles.codeSlot}>
                  <Text style={styles.codeText}>{code[index] ?? "-"}</Text>
                </View>
              ))}
              <TextInput
                ref={inputRef}
                value={code}
                onChangeText={handleChangeCode}
                onBlur={() => setTouched(true)}
                style={styles.hiddenInput}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                maxLength={6}
                caretHidden
              />
            </Pressable>

            {touched && errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

            <Pressable
              disabled={!isCodeValid}
              onPress={handleNextPress}
              style={({ pressed }) => [
                styles.nextButton,
                !isCodeValid && styles.buttonDisabled,
                pressed && isCodeValid && styles.buttonPressed,
              ]}
            >
              <Text style={styles.nextButtonText}>NEXT</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FBEAF4",
  },
  flexFill: {
    flex: 1,
  },
  page: {
    flexGrow: 1,
    backgroundColor: "#FBEAF4",
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: "center",
    minHeight: "100%",
  },
  content: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 6,
    left: 2,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  backButtonText: {
    color: "#111111",
    fontSize: 36,
    lineHeight: 36,
    fontWeight: "700",
    fontFamily: "Nunito",
    marginTop: -4,
  },
  mascotWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  mascotImage: {
    width: 170,
    height: 170,
    alignSelf: "center",
  },
  title: {
    color: "#111111",
    fontSize: 40,
    lineHeight: 44,
    fontWeight: "700",
    textAlign: "center",
    fontFamily: "Nunito",
    marginTop: 2,
  },
  subtitle: {
    color: "#111111",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
    textAlign: "center",
    fontFamily: "Nunito",
    marginTop: 38,
    maxWidth: 340,
  },
  codeRow: {
    width: "100%",
    marginTop: 62,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  codeSlot: {
    width: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  codeText: {
    color: "#111111",
    fontSize: 28,
    lineHeight: 30,
    fontWeight: "700",
    fontFamily: "Nunito",
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  errorText: {
    marginTop: 8,
    color: "#D63B5B",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    fontFamily: "Nunito",
  },
  nextButton: {
    width: 248,
    minHeight: 68,
    borderRadius: 18,
    marginTop: 40,
    alignSelf: "flex-end",
    backgroundColor: "#E58DDC",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#B356B5",
    shadowOpacity: 0.45,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "700",
    fontFamily: "Nunito",
  },
  buttonPressed: {
    transform: [{ translateY: 2 }],
    opacity: 0.82,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
});