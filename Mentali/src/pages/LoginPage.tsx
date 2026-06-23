import { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CountryPicker, { Country, CountryCode } from "react-native-country-picker-modal";
import {
  AsYouType,
  CountryCode as PhoneCountryCode,
  isValidPhoneNumber,
} from "libphonenumber-js";

const mascotSource = require("../../assets/images/LoginMascot.png");
const googleIconSource = require("../../assets/images/GoogleIcon.png");
const appleIconSource = require("../../assets/images/AppleIcon.png");

export type LoginMode = "phone" | "email";

type LoginPageProps = {
  mode: LoginMode;
  onToggleMode: () => void;
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

function SocialButton({ label, iconSource }: { label: string; iconSource: number }) {
  return (
    <Pressable style={({ pressed }) => [styles.socialButton, pressed && styles.pressedButton]}>
      <View style={styles.socialIcon}>
        <Image source={iconSource} resizeMode="contain" style={styles.socialIconImage} />
      </View>
      <Text style={styles.socialLabel}>{label}</Text>
    </Pressable>
  );
}

export default function LoginPage({ mode, onToggleMode }: LoginPageProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [countryCode, setCountryCode] = useState<CountryCode>("SG");
  const [callingCode, setCallingCode] = useState("65");
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const phoneCountryCode = countryCode as PhoneCountryCode;

  const phoneDigits = phoneNumber.replace(/\D/g, "");
  const isPhoneValid = phoneDigits.length > 0 && isValidPhoneNumber(phoneNumber, phoneCountryCode);
  const showPhoneError = mode === "phone" && phoneDigits.length > 0 && !isPhoneValid;

  const subtitleText = useMemo(() => {
    if (mode === "phone") {
      return {
        prefix: "Enter your ",
        highlight: "mobile number",
        suffix: " or email",
      };
    }

    return {
      prefix: "Enter your mobile number or ",
      highlight: "email",
      suffix: "",
    };
  }, [mode]);

  const inputPlaceholder = mode === "phone" ? "99999999" : "banana12@gmail.com";
  const inputValue = mode === "phone" ? phoneNumber : emailAddress;
  const onChangeInput = mode === "phone" ? setPhoneNumber : setEmailAddress;
  const keyboardType = mode === "phone" ? "phone-pad" : "email-address";
  const autoComplete = mode === "phone" ? "tel" : "email";

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
      <View style={styles.page}>
        <View style={styles.content}>
          <Mascot />

          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.title}>to Mentali!</Text>

          <View style={styles.subtitleRow}>
            <Text style={styles.subtitle}>{subtitleText.prefix}</Text>
            <Pressable onPress={onToggleMode} hitSlop={6} style={({ pressed }) => pressed && styles.pressedButton}>
              <Text style={styles.subtitleAccent}>{subtitleText.highlight}</Text>
            </Pressable>
            <Text style={styles.subtitle}>{subtitleText.suffix}</Text>
          </View>

          <View style={styles.fieldBlock}>
            <View style={styles.inputShell}>
              {mode === "phone" ? (
                <>
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
                </>
              ) : null}
              <TextInput
                value={inputValue}
                onChangeText={mode === "phone" ? handlePhoneChange : onChangeInput}
                placeholder={inputPlaceholder}
                placeholderTextColor="#B8B8B8"
                style={styles.input}
                keyboardType={keyboardType}
                autoComplete={autoComplete}
                autoCapitalize="none"
                maxLength={mode === "phone" ? 25 : undefined}
              />
            </View>
            {showPhoneError ? (
              <Text style={styles.phoneErrorText}>Enter a valid phone number for the selected country.</Text>
            ) : null}
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Enter your password</Text>
            <View style={styles.inputShell}>
              <TextInput
                value={password}
                onChangeText={setPassword}
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
          </View>

          <Pressable style={({ pressed }) => [styles.forgotRow, pressed && styles.pressedButton]}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>

          <Pressable style={({ pressed }) => [styles.loginButton, pressed && styles.loginButtonPressed]}>
            <Text style={styles.loginButtonText}>LOGIN</Text>
          </Pressable>

          <Text style={styles.signupText}>
            Don’t have an account? <Text style={styles.signupLink}>Sign Up</Text>
          </Text>

          <Text style={styles.orText}>or</Text>

          <SocialButton label="Continue with Google" iconSource={googleIconSource} />
          <SocialButton label="Continue with Apple" iconSource={appleIconSource} />
        </View>
      </View>

      {mode === "phone" ? (
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
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FBEAF4",
  },
  page: {
    flexGrow: 1,
    backgroundColor: "#FBEAF4",
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: "center",
  },
  content: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    alignItems: "center",
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
  subtitleAccent: {
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
  forgotRow: {
    alignSelf: "flex-end",
    marginTop: 10,
  },
  forgotText: {
    color: "#111111",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "700",
    fontFamily: "Nunito",
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
  signupLink: {
    color: "#2D7FEF",
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