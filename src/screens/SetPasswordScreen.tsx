/**
 * Set Password Screen
 * For registration flow after OTP verification
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PasswordInput, BackIcon } from '../components/common';
import { Colors, Spacing, BorderRadius, Typography } from '../config/theme';
import { isValidPassword } from '../utils/validation';
import { authService } from '../services';

interface SetPasswordScreenProps {
  navigation?: {
    goBack?: () => void;
    navigate?: (screen: string, params?: any) => void;
    reset?: (params: any) => void;
  };
  route?: {
    params?: {
      phoneNumber?: string;
    };
  };
}

export const SetPasswordScreen: React.FC<SetPasswordScreenProps> = ({
  navigation,
  route,
}) => {
  const phoneNumber = route?.params?.phoneNumber || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (!isValidPassword(password)) {
      newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = async () => {
    if (validateForm()) {
      try {
        const response = await authService.registerWithOTP({
          phone: phoneNumber,
          password,
        });
        
        if (response.success && response.token) {
          // Navigate to home after successful registration
          navigation?.reset?.({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        } else {
          Alert.alert('Error', response.message || 'Failed to set password');
        }
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to set password. Please try again.');
      }
    }
  };

  const handleSkip = () => {
    // Skip password setup and navigate to login
    navigation?.reset?.({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation?.goBack?.()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <BackIcon size={24} color={Colors.light.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Set a password</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Password Input */}
          <PasswordInput
            label="Enter Password*"
            placeholder="Enter password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) {
                setErrors({ ...errors, password: undefined });
              }
            }}
            error={errors.password}
          />

          {/* Confirm Password Input */}
          <PasswordInput
            label="Confirm Password*"
            placeholder="Enter password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword) {
                setErrors({ ...errors, confirmPassword: undefined });
              }
            }}
            error={errors.confirmPassword}
          />

          {/* Confirm Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
              <Text style={styles.confirmButtonArrow}>→</Text>
            </TouchableOpacity>
          </View>

          {/* Skip Link */}
          <View style={styles.skipContainer}>
            <TouchableOpacity
              onPress={handleSkip}
              activeOpacity={0.7}
              style={styles.skipButton}
            >
              <Text style={styles.skipText}>Skip</Text>
              <Text style={styles.skipArrow}>→</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xs,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.light.text,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 40,
  },
  buttonContainer: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  confirmButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minHeight: 48,
    flexDirection: 'row',
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
  confirmButtonText: {
    ...Typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: Spacing.sm,
  },
  confirmButtonArrow: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  skipContainer: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skipText: {
    ...Typography.body,
    color: Colors.light.primary,
    fontWeight: '600',
    marginRight: Spacing.xs,
  },
  skipArrow: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: '600',
  },
});


