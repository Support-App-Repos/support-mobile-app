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
  const [errors, setErrors] = useState<{
    email?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendResetEmail = async () => {
    if (validateForm()) {
      setIsLoading(true);
      setSuccessMessage('');
      try {
        const response = await authService.forgotPassword(email.trim());
        
        if (response.success) {
          setSuccessMessage('Password reset email sent! Please check your inbox and follow the instructions.');
          setEmail('');
        } else {
          setErrors({ email: response.message || 'Failed to send reset email' });
        }
      } catch (error: any) {
        setErrors({ email: error.message || 'Failed to send reset email. Please try again.' });
      } finally {
        setIsLoading(false);
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
            <Text style={styles.sectionTitle}>Forgot password</Text>
            <Text style={styles.sectionDescription}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>
          </View>

          {/* Success Message */}
          {successMessage ? (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          ) : null}

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
              if (successMessage) {
                setSuccessMessage('');
              }
            }}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />

          {/* Send Reset Email Button */}
          <View style={styles.updateButtonContainer}>
            <TouchableOpacity
              style={[styles.updateButton, isLoading && styles.updateButtonDisabled]}
              onPress={handleSendResetEmail}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <Text style={styles.updateButtonText}>
                {isLoading ? 'Sending...' : 'Send reset link'}
              </Text>
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
  },
  updateButtonDisabled: {
    opacity: 0.6,
  },
  successContainer: {
    backgroundColor: '#E8F5E9',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  successText: {
    ...Typography.body,
    color: '#2E7D32',
    textAlign: 'center',
  },
});

