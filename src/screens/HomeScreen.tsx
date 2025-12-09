/**
 * Home Screen
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card } from '../components/common';
import { Colors, Spacing, Typography } from '../config/theme';
import { authService } from '../services';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // Call logout service
      await authService.logout();
      
      // Reset navigation stack and navigate to Login screen
      navigation?.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local storage and navigate to login
      await authService.logout(); // This will clear storage even if API fails
      // Reset navigation stack and navigate to Login screen
      navigation?.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: handleLogout,
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>React Native App</Text>
        </View>

        <Card>
          <Text style={styles.cardTitle}>Getting Started</Text>
          <Text style={styles.cardText}>
            This is your home screen. Start building your app from here.
          </Text>
        </Card>

        <View style={styles.actions}>
          <Button
            title="Logout"
            onPress={confirmLogout}
            variant="primary"
            loading={isLoggingOut}
            disabled={isLoggingOut}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
  },
  header: {
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  title: {
    ...Typography.h1,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.light.textSecondary,
  },
  cardTitle: {
    ...Typography.h3,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  cardText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
  },
  actions: {
    marginTop: Spacing.lg,
  },
});



