/**
 * Register OTP Screen (Create Account via OTP)
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
import { BackIcon, PhoneNumberInput } from '../components/common';
import { Checkbox } from '../components/common/Checkbox';
import { Colors, Spacing, BorderRadius, Typography } from '../config/theme';
import { authService } from '../services';

interface RegisterOTPScreenProps {
  navigation?: {
    goBack?: () => void;
    navigate?: (screen: string, params?: any) => void;
  };
}

export const RegisterOTPScreen: React.FC<RegisterOTPScreenProps> = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const [errors, setErrors] = useState<{
    phoneNumber?: string;
    terms?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (phoneNumber.trim().length < 10) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    if (!termsAccepted) {
      newErrors.terms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (validateForm()) {
      try {
        const response = await authService.sendOTP(phoneNumber.trim());
        
        if (response.success) {
          // Navigate to OTP verification screen
          navigation?.navigate?.('OTPVerification', {
            phoneNumber: phoneNumber.trim(),
            flow: 'register',
          });
        } else {
          setErrors({ ...errors, phoneNumber: response.message || 'Failed to send OTP' });
        }
      } catch (error: any) {
        setErrors({ ...errors, phoneNumber: error.message || 'Failed to send OTP. Please try again.' });
      }
    }
  };

  const handleTermsPress = () => {
    // Navigate to terms screen
    console.log('Terms and Conditions');
  };

  const handlePrivacyPress = () => {
    // Navigate to privacy policy screen
    console.log('Privacy Policy');
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
            <Text style={styles.headerTitle}>Create account</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Section Title */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Create your account</Text>
            <Text style={styles.sectionDescription}>
              Enter phone number, otp, and set password to create your account
            </Text>
          </View>

          {/* Phone Number Input */}
          <PhoneNumberInput
            label="Phone Number*"
            value={phoneNumber}
            onChangeText={(text) => {
              setPhoneNumber(text);
              if (errors.phoneNumber) {
                setErrors({ ...errors, phoneNumber: undefined });
              }
            }}
            onGetCode={handleRegister}
            error={errors.phoneNumber}
            showGetCodeButton={false}
          />

          {/* Terms and Conditions Checkbox */}
          <Checkbox
            checked={termsAccepted}
            onToggle={setTermsAccepted}
            labelComponent={
              <Text style={styles.checkboxLabel}>
                By continuing, you agree to our{' '}
                <Text style={styles.linkText} onPress={handleTermsPress}>
                  Terms and Conditions
                </Text>
                {' & '}
                <Text style={styles.linkText} onPress={handlePrivacyPress}>
                  Privacy Policy
                </Text>
              </Text>
            }
            containerStyle={styles.checkboxContainer}
          />
          {errors.terms && (
            <Text style={styles.errorText}>{errors.terms}</Text>
          )}

          {/* Register Button */}
          <View style={styles.registerButtonContainer}>
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              activeOpacity={0.8}
            >
              <Text style={styles.registerButtonText}>Register</Text>
              <Text style={styles.registerButtonArrow}>→</Text>
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
  checkboxContainer: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  checkboxLabel: {
    ...Typography.body,
    color: Colors.light.text,
    lineHeight: 22,
    flex: 1,
  },
  linkText: {
    color: Colors.light.primary,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  errorText: {
    ...Typography.small,
    color: Colors.light.error,
    marginTop: -Spacing.sm,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  registerButtonContainer: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  registerButton: {
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
  registerButtonText: {
    ...Typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: Spacing.sm,
  },
  registerButtonArrow: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});


