/**
 * Main App Navigator
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  HomeScreen,
  LoginScreen,
  RegisterEmailScreen,
  ForgotPasswordScreen,
  PasswordChangedScreen,
  OTPVerificationScreen,
  SelectCategoryScreen,
  ProductListingScreen,
  SelectEventTypeScreen,
  EventListingScreen,
  SelectServiceTypeScreen,
  ServiceListingScreen,
  PropertyListingScreen,
  PaymentScreen,
  SelectRegionScreen,
  ReviewScreen,
  PublishScreen,
  ProfileScreen,
  EditProfileScreen,
  MyListingsScreen,
  ListingDetailScreen,
  EventListingDetailScreen,
  PropertyListingDetailScreen,
  ServiceListingDetailScreen,
} from '../screens';
import { RootStackParamList } from '../types';
import { authService } from '../services/authService';
import { ProfileProvider } from '../contexts/ProfileContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigationRef = useRef<NavigationContainerRef<any>>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await authService.isAuthenticated();
      setIsAuthenticated(authenticated);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Listen to navigation state changes to re-check auth when navigating to Login
  const handleNavigationStateChange = async () => {
    const currentRoute = navigationRef.current?.getCurrentRoute();
    if (currentRoute?.name === 'Login') {
      // Re-check auth status when navigating to Login
      const authenticated = await authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      if (authenticated) {
        // If still authenticated, navigate back to Home
        navigationRef.current?.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      }
    }
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ProfileProvider>
      <NavigationContainer
        ref={navigationRef}
        onStateChange={handleNavigationStateChange}
      >
        <Stack.Navigator
          initialRouteName={isAuthenticated ? 'Home' : 'Login'}
          screenOptions={{
            headerShown: false,
          }}
        >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />
        <Stack.Screen
          name="RegisterEmail"
          component={RegisterEmailScreen}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
        />
        <Stack.Screen
          name="PasswordChanged"
          component={PasswordChangedScreen}
        />
        <Stack.Screen
          name="OTPVerification"
          component={OTPVerificationScreen}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="SelectCategory"
          component={SelectCategoryScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ProductListing"
          component={ProductListingScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="SelectEventType"
          component={SelectEventTypeScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="EventListing"
          component={EventListingScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="SelectServiceType"
          component={SelectServiceTypeScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ServiceListing"
          component={ServiceListingScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="PropertyListing"
          component={PropertyListingScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Payment"
          component={PaymentScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="SelectRegion"
          component={SelectRegionScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Review"
          component={ReviewScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Publish"
          component={PublishScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="MyListings"
          component={MyListingsScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ListingDetail"
          component={ListingDetailScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="EventListingDetail"
          component={EventListingDetailScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="PropertyListingDetail"
          component={PropertyListingDetailScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ServiceListingDetail"
          component={ServiceListingDetailScreen}
          options={{
            headerShown: false,
          }}
        />
        </Stack.Navigator>
      </NavigationContainer>
    </ProfileProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
