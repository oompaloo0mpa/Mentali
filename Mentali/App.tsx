import { useState } from "react";
import LoginPage from "./src/pages/LoginPage";
import SignupPage from "./src/pages/SignupPage";

type AuthScreen = "login-phone" | "login-email" | "signup";

export default function App() {
  const [screen, setScreen] = useState<AuthScreen>("login-phone");

  if (screen === "signup") {
    return <SignupPage onSignInPress={() => setScreen("login-phone")} />;
  }

  return (
    <LoginPage
      mode={screen === "login-phone" ? "phone" : "email"}
      onToggleMode={() => setScreen((current) => (current === "login-phone" ? "login-email" : "login-phone"))}
      onSignupPress={() => setScreen("signup")}
    />
  );
}