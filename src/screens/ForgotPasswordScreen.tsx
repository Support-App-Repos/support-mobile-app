/**
 * Forgot Password Screen
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
import { Input, BackIcon } from '../components/common';
import { PasswordInput } from '../components/common/PasswordInput';
import { Colors, Spacing, BorderRadius, Typography } from '../config/theme';
import { isValidEmail } from '../utils/validation';
import { authService } from '../services';

interface ForgotPasswordScreenProps {
  navigation?: {
    goBack?: () => void;
    navigate?: (screen: string) => void;
  };
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  navigation,
}) => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState<{
    email?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = 'Password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdatePassword = async () => {
    if (validateForm()) {
      try {
        const response = await authService.resetPassword(email.trim(), newPassword);
        
        if (response.success) {
          // Navigate to password changed success screen after successful update
          navigation?.navigate?.('PasswordChanged');
        } else {
          setErrors({ ...errors, email: response.message || 'Failed to reset password' });
        }
      } catch (error: any) {
        setErrors({ ...errors, email: error.message || 'Failed to reset password. Please try again.' });
      }
    }
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
            <Text style={styles.headerTitle}>Forgot password</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Verify account</Text>
            <Text style={styles.sectionDescription}>
              Enter phone number & otp to update password.
            </Text>
          </View>

          {/* Email Input */}
          <Input
            label="Email*"
            placeholder="Enter Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) {
                setErrors({ ...errors, email: undefined });
              }
            }}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* New Password Input */}
          <PasswordInput
            label="Enter Password*"
            placeholder="Enter Password"
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              if (errors.newPassword) {
                setErrors({ ...errors, newPassword: undefined });
              }
              // Clear confirm password error if passwords match
              if (text === confirmPassword && errors.confirmPassword) {
                setErrors({ ...errors, confirmPassword: undefined });
              }
            }}
            error={errors.newPassword}
          />

          {/* Confirm Password Input */}
          <PasswordInput
            label="Confirm Password*"
            placeholder="Enter Password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword) {
                setErrors({ ...errors, confirmPassword: undefined });
              }
            }}
            error={errors.confirmPassword}
          />

          {/* Update Password Button */}
          <View style={styles.updateButtonContainer}>
            <TouchableOpacity
              style={styles.updateButton}
              onPress={handleUpdatePassword}
              activeOpacity={0.8}
            >
              <Text style={styles.updateButtonText}>Update password</Text>
              <Text style={styles.updateButtonArrow}>→</Text>
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
    marginBottom: Spacing.lg,
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
  sectionHeader: {
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.h2,
    color: Colors.light.text,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  sectionDescription: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    lineHeight: 22,
  },
  updateButtonContainer: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  updateButton: {
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
  updateButtonText: {
    ...Typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: Spacing.sm,
  },
  updateButtonArrow: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

