/**
 * Main App Component
 * Entry point for the React Native application
 *
 * @format
 */

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StripeProvider } from '@stripe/stripe-react-native';
import { AppNavigator } from './src/navigation';
import { STRIPE_PUBLISHABLE_KEY } from '@env';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <StripeProvider
      publishableKey={STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder'}
      merchantIdentifier="merchant.com.supportmobileapp" // Required for Apple Pay
    >
      <SafeAreaProvider>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor="#007AFF"
        />
        <AppNavigator />
      </SafeAreaProvider>
    </StripeProvider>
  );
}

export default App;
