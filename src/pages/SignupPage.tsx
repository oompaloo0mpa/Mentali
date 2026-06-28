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
import CountryPicker, { Country, CountryCode } from "react-native-country-picker-modal";
import { AsYouType, CountryCode as PhoneCountryCode, isValidPhoneNumber } from "libphonenumber-js";
import { isStrongPassword, isValidEmail } from "../utils/authValidation";
import { SocialAuthResult, useSocialAuth } from "../hooks/useSocialAuth";

const mascotSource = require("../../assets/images/LoginMascot.png");
const googleIconSource = require("../../assets/images/GoogleIcon.png");
const appleIconSource = require("../../assets/images/AppleIcon.png");

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

function SocialButton({
  label,
  iconSource,
  onPress,
  disabled,
}: {
  label: string;
  iconSource: number;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.socialButton, pressed && styles.pressedButton]}
    >
      <View style={styles.socialIcon}>
        <Image source={iconSource} resizeMode="contain" style={styles.socialIconImage} />
      </View>
      <Text style={styles.socialLabel}>{label}</Text>
    </Pressable>
  );
}

type SignupPageProps = {
  onBackPress: () => void;
  onSignInPress: () => void;
  onSocialAuthSuccess: (session: SocialAuthResult) => void;
};

export default function SignupPage({ onBackPress, onSignInPress, onSocialAuthSuccess }: SignupPageProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countryCode, setCountryCode] = useState<CountryCode>("SG");
  const [callingCode, setCallingCode] = useState("65");
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [touched, setTouched] = useState({
    phone: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const phoneCountryCode = countryCode as PhoneCountryCode;
  const { signInWithGoogle, signInWithApple, loadingProvider, googleAvailable } = useSocialAuth({
    onSuccess: onSocialAuthSuccess,
  });

  const phoneDigits = phoneNumber.replace(/\D/g, "");
  const isPhoneValid = phoneDigits.length > 0 && isValidPhoneNumber(phoneNumber, phoneCountryCode);
  const phoneError = phoneDigits.length > 0 && !isPhoneValid ? "Enter a valid phone number for the selected country." : "";
  const emailError = emailAddress.length > 0 && !isValidEmail(emailAddress) ? "Enter a valid email address." : "";
  const passwordError = password.length > 0 && !isStrongPassword(password)
    ? "Use at least 8 characters with a number, capital letter, and special symbol."
    : "";
  const confirmPasswordError =
    confirmPassword.length > 0 && confirmPassword !== password ? "Passwords do not match." : "";
  const isFormValid =
    phoneDigits.length > 0 &&
    isPhoneValid &&
    emailAddress.length > 0 &&
    isValidEmail(emailAddress) &&
    password.length > 0 &&
    isStrongPassword(password) &&
    confirmPassword.length > 0 &&
    confirmPassword === password;

  const formatPhoneDisplay = (text: string, nextCountryCode = phoneCountryCode) => {
    const digits = text.replace(/\D/g, "").slice(0, 15);
    return new AsYouType(nextCountryCode).input(digits);
  };

  const handlePhoneChange = (text: string) => {
    setPhoneNumber(formatPhoneDisplay(text));
  };

  const handleCountrySelect = (country: Country) => {
    const nextCountryCode = country.cca2 as PhoneCountryCode;

    setCountryCode(country.cca2);
    setCallingCode(country.callingCode[0] ?? callingCode);
    setPhoneNumber(formatPhoneDisplay(phoneNumber, nextCountryCode));
    setCountryPickerVisible(false);
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

            <Text style={styles.title}>Create a new Mentali!</Text>

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Enter your mobile number</Text>
              <View style={styles.inputShell}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Select country code"
                  onPress={() => setCountryPickerVisible(true)}
                  style={({ pressed }) => [styles.countryCodeButton, pressed && styles.pressedButton]}
                >
                  <Text style={styles.countryCodeText}>+{callingCode}</Text>
                  <Text style={styles.countryCodeChevron}>⌄</Text>
                </Pressable>
                <View style={styles.phoneDivider} />
                <TextInput
                  value={phoneNumber}
                  onChangeText={handlePhoneChange}
                  onBlur={() => setTouched((current) => ({ ...current, phone: true }))}
                  placeholder="99999999"
                  placeholderTextColor="#B8B8B8"
                  style={styles.input}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  autoCapitalize="none"
                  maxLength={25}
                />
              </View>
              {touched.phone && phoneError ? <Text style={styles.phoneErrorText}>{phoneError}</Text> : null}
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Enter your email</Text>
              <View style={styles.inputShell}>
                <TextInput
                  value={emailAddress}
                  onChangeText={setEmailAddress}
                  onBlur={() => setTouched((current) => ({ ...current, email: true }))}
                  placeholder="banana12@gmail.com"
                  placeholderTextColor="#B8B8B8"
                  style={styles.input}
                  keyboardType="email-address"
                  autoComplete="email"
                  autoCapitalize="none"
                />
              </View>
              {touched.email && emailError ? <Text style={styles.phoneErrorText}>{emailError}</Text> : null}
            </View>

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
              {touched.password && passwordError ? <Text style={styles.phoneErrorText}>{passwordError}</Text> : null}
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
                <Text style={styles.phoneErrorText}>{confirmPasswordError}</Text>
              ) : null}
            </View>

            <Pressable
              disabled={!isFormValid}
              style={({ pressed }) => [
                styles.loginButton,
                !isFormValid && styles.buttonDisabled,
                pressed && isFormValid && styles.loginButtonPressed,
              ]}
            >
              <Text style={styles.loginButtonText}>REGISTER</Text>
            </Pressable>

            <Text style={styles.signupText}>
              Already have an account?{" "}
              <Text onPress={onSignInPress} style={styles.linkText} suppressHighlighting>
                Sign In
              </Text>
            </Text>

            <Text style={styles.orText}>or</Text>

            <SocialButton
              label="Continue with Google"
              iconSource={googleIconSource}
              onPress={signInWithGoogle}
              disabled={loadingProvider !== null || !googleAvailable}
            />
            <SocialButton
              label="Continue with Apple"
              iconSource={appleIconSource}
              onPress={signInWithApple}
              disabled={loadingProvider !== null}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CountryPicker
        countryCode={countryCode}
        withCallingCode
        withFilter
        withFlag={false}
        withEmoji={false}
        withAlphaFilter={false}
        withFlagButton={false}
        visible={countryPickerVisible}
        onClose={() => setCountryPickerVisible(false)}
        onSelect={handleCountrySelect}
      />
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
  subtitleRow: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 16,
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
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "700",
    textAlign: "center",
    fontFamily: "Nunito",
    marginTop: 2,
  },
  subtitle: {
    color: "#111111",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "700",
    textAlign: "left",
    fontFamily: "Nunito",
  },
  linkText: {
    color: "#2D7FEF",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "700",
    fontFamily: "Nunito",
  },
  fieldBlock: {
    width: "100%",
    marginTop: 14,
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
  countryCodeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 12,
  },
  countryCodeText: {
    color: "#111111",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Nunito",
  },
  countryCodeChevron: {
    marginLeft: 6,
    color: "#111111",
    fontSize: 16,
    lineHeight: 16,
    fontWeight: "700",
    includeFontPadding: false,
    textAlignVertical: "center",
    transform: [{ translateY: -1 }],
  },
  phoneDivider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: "#D8D1D8",
    marginRight: 14,
  },
  input: {
    flex: 1,
    color: "#111111",
    fontSize: 18,
    fontWeight: "700",
    paddingVertical: 0,
    fontFamily: "Nunito",
  },
  phoneErrorText: {
    marginTop: 6,
    color: "#C54B68",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "700",
    fontFamily: "Nunito",
    alignSelf: "flex-start",
  },
  eyeButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  eyeIcon: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  eyeOutline: {
    width: 22,
    height: 14,
    borderRadius: 11,
    borderWidth: 1.7,
    borderColor: "#A8A8A8",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-2deg" }],
  },
  eyePupil: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#A8A8A8",
  },
  eyeSlash: {
    position: "absolute",
    width: 18,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#A8A8A8",
    transform: [{ rotate: "-38deg" }],
  },
  loginButton: {
    marginTop: 14,
    width: "100%",
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: "#EE91E0",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#B455B3",
    shadowOpacity: 0.25,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    borderBottomWidth: 6,
    borderBottomColor: "#C664B9",
  },
  loginButtonPressed: {
    transform: [{ translateY: 2 }],
    borderBottomWidth: 3,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 0.8,
    fontFamily: "Nunito",
  },
  signupText: {
    marginTop: 14,
    color: "#111111",
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
    textAlign: "center",
    fontFamily: "Nunito",
  },
  orText: {
    marginTop: 10,
    color: "#111111",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    fontFamily: "Nunito",
  },
  socialButton: {
    marginTop: 12,
    width: "100%",
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#D9D9D9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    shadowColor: "#7B58A1",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  socialIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  socialIconImage: {
    width: 24,
    height: 24,
  },
  socialLabel: {
    color: "#303030",
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "700",
    fontFamily: "Nunito",
  },
  pressedButton: {
    opacity: 0.9,
  },
});