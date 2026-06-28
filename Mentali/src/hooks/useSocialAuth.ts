import * as AppleAuthentication from "expo-apple-authentication";
import * as Google from "expo-auth-session/providers/google";
import Constants, { ExecutionEnvironment } from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useMemo, useState } from "react";
import { Alert, Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

export type SocialProvider = "google" | "apple";

export type SocialAuthResult = {
    provider: SocialProvider;
    email?: string;
    fullName?: string;
    accessToken?: string;
    identityToken?: string;
    authorizationCode?: string;
};

type UseSocialAuthOptions = {
    onSuccess: (result: SocialAuthResult) => void;
};

function getGoogleClientIds() {
    return {
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    };
}

function isExpoGo() {
    return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

function getPlatformGoogleClientId() {
    if (Platform.OS === "ios") {
        return process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
    }

    if (Platform.OS === "android") {
        return process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
    }

    return undefined;
}

export function useSocialAuth({ onSuccess }: UseSocialAuthOptions) {
    const googleClientIds = useMemo(getGoogleClientIds, []);
    const googlePlatformClientId = useMemo(getPlatformGoogleClientId, []);
    const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);

    const [googleRequest, googleResponse, promptGoogleAsync] = Google.useAuthRequest({
        iosClientId: googleClientIds.iosClientId,
        androidClientId: googleClientIds.androidClientId,
        scopes: ["profile", "email"],
    });

    useEffect(() => {
        if (!googleResponse) {
            return;
        }

        if (googleResponse.type === "success") {
            onSuccess({
                provider: "google",
                accessToken: googleResponse.authentication?.accessToken,
                identityToken: googleResponse.authentication?.idToken ?? googleResponse.params.id_token,
            });
            setLoadingProvider(null);
            return;
        }

        if (googleResponse.type === "error" || googleResponse.type === "dismiss") {
            setLoadingProvider(null);
        }
    }, [googleResponse, onSuccess]);

    const signInWithGoogle = async () => {
        if (isExpoGo()) {
            Alert.alert(
                "Google sign-in unavailable in Expo Go",
                "Expo Go cannot complete OAuth redirects for Google sign-in. Use an Expo Development Build or standalone build for Google authentication."
            );
            return;
        }

        if (!googlePlatformClientId) {
            Alert.alert(
                "Google sign-in not configured",
                Platform.OS === "ios"
                    ? "Set EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID before testing Google sign-in on iOS."
                    : "Set EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID before testing Google sign-in on Android."
            );
            return;
        }

        setLoadingProvider("google");
        try {
            await promptGoogleAsync();
        } catch (error) {
            setLoadingProvider(null);
            const message = error instanceof Error ? error.message : "Unable to start Google sign-in.";
            Alert.alert("Google sign-in failed", message);
        }
    };

    const signInWithApple = async () => {
        if (Platform.OS !== "ios") {
            Alert.alert("Apple sign-in unavailable", "Sign in with Apple is only available on iOS.");
            return;
        }

        const isAvailable = await AppleAuthentication.isAvailableAsync();
        if (!isAvailable) {
            Alert.alert("Apple sign-in unavailable", "This device does not support Sign in with Apple.");
            return;
        }

        setLoadingProvider("apple");
        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
            });

            onSuccess({
                provider: "apple",
                email: credential.email ?? undefined,
                fullName: credential.fullName ? [credential.fullName.givenName, credential.fullName.familyName].filter(Boolean).join(" ") : undefined,
                identityToken: credential.identityToken ?? undefined,
                authorizationCode: credential.authorizationCode ?? undefined,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to complete Apple sign-in.";
            if (!message.toLowerCase().includes("cancel")) {
                Alert.alert("Apple sign-in failed", message);
            }
        } finally {
            setLoadingProvider(null);
        }
    };

    return {
        signInWithGoogle,
        signInWithApple,
        loadingProvider,
        googleAvailable: !isExpoGo() && !!googlePlatformClientId && !!googleRequest,
        googleReady: !!googleRequest,
    };
}