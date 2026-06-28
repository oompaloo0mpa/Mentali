import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginPage from './src/pages/LoginPage';
import HomePage from './src/pages/HomePage';

export default function App() {
  const [showHome, setShowHome] = useState(false);

  return (
    <SafeAreaProvider>
      {showHome ? (
        <HomePage />
      ) : (
        <LoginPage
          mode="phone"
          onToggleMode={() => {}}
          onSignupPress={() => {}}
          onForgotPasswordPress={() => {}}
          onLoginPress={() => setShowHome(true)}
          onSocialAuthSuccess={() => setShowHome(true)}
        />
      )}
    </SafeAreaProvider>
  );
}
