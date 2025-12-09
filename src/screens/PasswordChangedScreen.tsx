/**
 * Password Changed Success Screen
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, Typography } from '../config/theme';
import { PasswordChangedIcon } from '../components/common';

interface PasswordChangedScreenProps {
  navigation?: {
    navigate?: (screen: string) => void;
    reset?: (params: any) => void;
  };
}

export const PasswordChangedScreen: React.FC<PasswordChangedScreenProps> = ({
  navigation,
}) => {
  const handleBackToLogin = () => {
    // Navigate back to login screen
    // Reset navigation stack to prevent going back to forgot password
    navigation?.reset?.({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Centered Content */}
        <View style={styles.centeredContent}>
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <PasswordChangedIcon size={120} />
          </View>

          {/* Success Message */}
          <View style={styles.messageContainer}>
            <Text style={styles.title}>Password Changed!</Text>
            <Text style={styles.description}>
              Your password has been changed successfully
            </Text>
          </View>
        </View>

        {/* Back to Login Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleBackToLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Back to login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    marginBottom: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  title: {
    ...Typography.h1,
    color: Colors.light.text,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  description: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    paddingBottom: Spacing.xl,
    marginTop: Spacing.xxl,
  },
  button: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    ...Typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

