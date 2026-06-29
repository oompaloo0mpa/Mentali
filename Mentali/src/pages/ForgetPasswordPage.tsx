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
import { isValidEmail } from "../utils/authValidation";

const mascotSource = require("../../assets/images/LoginMascot.png");

type ForgetPasswordPageProps = {
  mode: "phone" | "email";
  onToggleMode: () => void;
  onNextPress: (payload: { mode: "phone" | "email"; value: string }) => void | Promise<void>;
  onBackPress: () => void;
};

function Mascot() {
  return (
    <View style={styles.mascotWrap}>
      <Image source={mascotSource} resizeMode="contain" style={styles.mascotImage} />
    </View>
  );
}

export default function ForgetPasswordPage({ mode, onToggleMode, onNextPress, onBackPress }: ForgetPasswordPageProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [countryCode, setCountryCode] = useState<CountryCode>("SG");
  const [callingCode, setCallingCode] = useState("65");
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [touched, setTouched] = useState(false);

  const isPhoneMode = mode === "phone";
  const phoneCountryCode = countryCode as PhoneCountryCode;
  const phoneDigits = phoneNumber.replace(/\D/g, "");
  const isPhoneValid = phoneDigits.length > 0 && isValidPhoneNumber(phoneNumber, phoneCountryCode);
  const isEmailValid = isValidEmail(emailAddress);

  const errorText = isPhoneMode
    ? phoneDigits.length > 0 && !isPhoneValid
      ? "Enter a valid phone number for the selected country."
      : ""
    : emailAddress.length > 0 && !isEmailValid
      ? "Enter a valid email address."
      : "";
  const isFormValid = isPhoneMode ? isPhoneValid : isEmailValid;

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

  const handleNextPress = () => {
    setTouched(true);
    if (errorText) {
      return;
    }

    onNextPress({
      mode,
      value: isPhoneMode ? phoneNumber.trim() : emailAddress.trim().toLowerCase(),
    });
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

            <Text style={styles.title}>Forget Password</Text>

            <Text style={styles.subtitle}>
              {isPhoneMode
                ? "Enter the phone number linked to the lost account to recover the password"
                : "Enter the email linked to the lost account to recover the password"}
            </Text>

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>{isPhoneMode ? "Enter your mobile number" : "Enter your email"}</Text>
              <View style={styles.inputShell}>
                {isPhoneMode ? (
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
                    <TextInput
                      value={phoneNumber}
                      onChangeText={handlePhoneChange}
                      onBlur={() => setTouched(true)}
                      placeholder="99999999"
                      placeholderTextColor="#B8B8B8"
                      style={styles.input}
                      keyboardType="phone-pad"
                      autoComplete="tel"
                      autoCapitalize="none"
                      maxLength={25}
                    />
                  </>
                ) : (
                  <TextInput
                    value={emailAddress}
                    onChangeText={setEmailAddress}
                    onBlur={() => setTouched(true)}
                    placeholder="banana12@gmail.com"
                    placeholderTextColor="#B8B8B8"
                    style={styles.input}
                    keyboardType="email-address"
                    autoComplete="email"
                    textContentType="emailAddress"
                    autoCapitalize="none"
                    editable
                    selectTextOnFocus
                  />
                )}
              </View>
              {touched && errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
            </View>

            <Text style={styles.switchText}>
              Use your {isPhoneMode ? "email" : "phone number"} instead?{" "}
              <Text onPress={onToggleMode} style={styles.linkText} suppressHighlighting>
                Verify here
              </Text>
            </Text>

            <Pressable
              disabled={!isFormValid}
              onPress={handleNextPress}
              style={({ pressed }) => [
                styles.button,
                !isFormValid && styles.buttonDisabled,
                pressed && isFormValid && styles.buttonPressed,
              ]}
            >
              <Text style={styles.buttonText}>VERIFY</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {isPhoneMode ? (
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
    marginTop: 32,
  },
  fieldBlock: {
    width: "100%",
    marginTop: 28,
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
    gap: 6,
  },
  countryCodeText: {
    color: "#111111",
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "Nunito",
  },
  countryCodeChevron: {
    color: "#111111",
    fontSize: 18,
    fontWeight: "700",
    marginTop: -2,
    fontFamily: "Nunito",
  },
  phoneDivider: {
    width: 1.5,
    height: 26,
    backgroundColor: "#DBD4DC",
    marginHorizontal: 12,
  },
  input: {
    flex: 1,
    color: "#111111",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Nunito",
    paddingVertical: 0,
  },
  errorText: {
    marginTop: 8,
    color: "#D63B5B",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    fontFamily: "Nunito",
  },
  switchText: {
    marginTop: 24,
    color: "#111111",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
    textAlign: "center",
    fontFamily: "Nunito",
  },
  linkText: {
    color: "#2D7FEF",
    fontSize: 18,
    lineHeight: 24,
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
  buttonPressed: {
    transform: [{ translateY: 2 }],
  },
  buttonDisabled: {
    opacity: 0.45,
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
  },
});