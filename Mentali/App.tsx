import { useState } from "react";
import LoginPage, { LoginMode } from "./src/pages/LoginPage";

export default function App() {
  const [mode, setMode] = useState<LoginMode>("phone");

  return (
    <LoginPage
      mode={mode}
      onToggleMode={() => setMode((current) => (current === "phone" ? "email" : "phone"))}
    />
  );
}