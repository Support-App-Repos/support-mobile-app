/**
 * Main App Navigator
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
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
} from '../screens';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};


