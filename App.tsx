import { useState } from "react";
import ForgetPasswordPage from "./src/pages/ForgetPasswordPage";
import LoginPage from "./src/pages/LoginPage";
import ResetPasswordPage from "./src/pages/ResetPasswordPage";
import SignedInPage from "./src/pages/SignedInPage";
import SignupPage from "./src/pages/SignupPage";
import VerifyCodePage from "./src/pages/VerifyCodePage";
import type { SocialAuthResult } from "./src/hooks/useSocialAuth";

type AuthMode = "phone" | "email";
type AuthScreen = "login" | "signup" | "forgot" | "verify" | "reset";

export default function App() {
  const [screen, setScreen] = useState<AuthScreen>("login");
  const [loginMode, setLoginMode] = useState<AuthMode>("phone");
  const [recoveryMode, setRecoveryMode] = useState<AuthMode>("email");
  const [session, setSession] = useState<SocialAuthResult | null>(null);

  if (session) {
    return (
      <SignedInPage
        session={session}
        onSignOut={() => {
          setSession(null);
          setScreen("login");
        }}
      />
    );
  }

  if (screen === "signup") {
    return (
      <SignupPage
        onBackPress={() => setScreen("login")}
        onSignInPress={() => setScreen("login")}
        onSocialAuthSuccess={(nextSession) => setSession(nextSession)}
      />
    );
  }

  if (screen === "forgot") {
    return (
      <ForgetPasswordPage
        mode={recoveryMode}
        onToggleMode={() => setRecoveryMode((current) => (current === "phone" ? "email" : "phone"))}
        onNextPress={() => setScreen("verify")}
        onBackPress={() => setScreen("login")}
      />
    );
  }

  if (screen === "verify") {
    return (
      <VerifyCodePage
        mode={recoveryMode}
        onNextPress={() => setScreen("reset")}
        onBackPress={() => setScreen("forgot")}
      />
    );
  }

  if (screen === "reset") {
    return (
      <ResetPasswordPage
        onDonePress={() => {
          setLoginMode(recoveryMode);
          setScreen("login");
        }}
        onBackPress={() => setScreen("verify")}
      />
    );
  }

  return (
    <LoginPage
      mode={loginMode}
      onToggleMode={() => setLoginMode((current) => (current === "phone" ? "email" : "phone"))}
      onSignupPress={() => setScreen("signup")}
      onForgotPasswordPress={() => {
        setRecoveryMode(loginMode);
        setScreen("forgot");
      }}
      onSocialAuthSuccess={(nextSession) => setSession(nextSession)}
    />
  );
}