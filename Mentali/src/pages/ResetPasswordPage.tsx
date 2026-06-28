import { useState } from "react";
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
import { isStrongPassword } from "../utils/authValidation";

const mascotSource = require("../../assets/images/LoginMascot.png");

type ResetPasswordPageProps = {
  onDonePress: () => void;
  onBackPress: () => void;
};

function Mascot() {
  return (
    <View style={styles.mascotWrap}>
      <Image source={mascotSource} resizeMode="contain" style={styles.mascotImage} />
    </View>
  );
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  return (
    <View style={styles.eyeIcon}>
      <View style={styles.eyeOutline}>
        <View style={styles.eyePupil} />
      </View>
      {hidden ? <View style={styles.eyeSlash} /> : null}
    </View>
  );
}

export default function ResetPasswordPage({ onDonePress, onBackPress }: ResetPasswordPageProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({ password: false, confirmPassword: false });

  const passwordError = password.length > 0 && !isStrongPassword(password)
    ? "Use at least 8 characters with a number, capital letter, and special symbol."
    : "";
  const confirmPasswordError = confirmPassword.length > 0 && confirmPassword !== password ? "Passwords do not match." : "";
  const isFormValid = password.length > 0 && confirmPassword.length > 0 && !passwordError && !confirmPasswordError;

  const handleDonePress = () => {
    setTouched({ password: true, confirmPassword: true });
    if (passwordError || confirmPasswordError || password.length === 0 || confirmPassword.length === 0) {
      return;
    }

    onDonePress();
  };

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
              style={({ pressed }) => [styles.backButton, pressed && styles.pressedButton]}
            >
              <Text style={styles.backButtonText}>‹</Text>
            </Pressable>

            <Mascot />

            <Text style={styles.title}>
              Reset Your{"\n"}
              Password
            </Text>

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Enter your password</Text>
              <View style={styles.inputShell}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  onBlur={() => setTouched((current) => ({ ...current, password: true }))}
                  placeholder="banana123"
                  placeholderTextColor="#B8B8B8"
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  autoCapitalize="none"
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                  onPress={() => setShowPassword((current) => !current)}
                  style={({ pressed }) => [styles.eyeButton, pressed && styles.pressedButton]}
                >
                  <EyeIcon hidden={!showPassword} />
                </Pressable>
              </View>
              {touched.password && passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Re-Enter your password</Text>
              <View style={styles.inputShell}>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onBlur={() => setTouched((current) => ({ ...current, confirmPassword: true }))}
                  placeholder="banana123"
                  placeholderTextColor="#B8B8B8"
                  secureTextEntry={!showConfirmPassword}
                  style={styles.input}
                  autoCapitalize="none"
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={showConfirmPassword ? "Hide password" : "Show password"}
                  onPress={() => setShowConfirmPassword((current) => !current)}
                  style={({ pressed }) => [styles.eyeButton, pressed && styles.pressedButton]}
                >
                  <EyeIcon hidden={!showConfirmPassword} />
                </Pressable>
              </View>
              {touched.confirmPassword && confirmPasswordError ? (
                <Text style={styles.errorText}>{confirmPasswordError}</Text>
              ) : null}
            </View>

            <Pressable
              disabled={!isFormValid}
              onPress={handleDonePress}
              style={({ pressed }) => [
                styles.button,
                !isFormValid && styles.buttonDisabled,
                pressed && isFormValid && styles.pressedButton,
              ]}
            >
              <Text style={styles.buttonText}>RESET</Text>
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
    fontSize: 38,
    lineHeight: 42,
    fontWeight: "700",
    textAlign: "center",
    fontFamily: "Nunito",
    marginTop: 10,
  },
  fieldBlock: {
    width: "100%",
    marginTop: 18,
  },
  fieldLabel: {
    color: "#111111",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "700",
    marginBottom: 10,
    fontFamily: "Nunito",
  },
  inputShell: {
    width: "100%",
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#D8D1D8",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#D58EE0",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  input: {
    flex: 1,
    color: "#111111",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Nunito",
    paddingVertical: 0,
  },
  eyeButton: {
    marginLeft: 10,
    padding: 4,
  },
  eyeIcon: {
    width: 28,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  eyeOutline: {
    width: 26,
    height: 18,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#BDBDBD",
    alignItems: "center",
    justifyContent: "center",
  },
  eyePupil: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#BDBDBD",
  },
  eyeSlash: {
    position: "absolute",
    width: 28,
    height: 2,
    backgroundColor: "#BDBDBD",
    transform: [{ rotate: "-25deg" }],
  },
  errorText: {
    marginTop: 8,
    color: "#D63B5B",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    fontFamily: "Nunito",
  },
  button: {
    width: "100%",
    minHeight: 68,
    borderRadius: 18,
    marginTop: 28,
    backgroundColor: "#E58DDC",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#B356B5",
    shadowOpacity: 0.45,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "700",
    fontFamily: "Nunito",
  },
  pressedButton: {
    opacity: 0.82,
    transform: [{ translateY: 2 }],
  },
  buttonDisabled: {
    opacity: 0.45,
  },
});