/**
 * OTP Verification Screen
 * Handles OTP verification for both Login and Registration
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OTPInput, BackIcon, LegalDocumentModal } from '../components/common';
import { Colors, Spacing, BorderRadius, Typography } from '../config/theme';
import { authService } from '../services';
import { TERMS_AND_CONDITIONS_CONTENT, PRIVACY_POLICY_CONTENT } from '../constants';

interface OTPVerificationScreenProps {
  navigation?: {
    goBack?: () => void;
    navigate?: (screen: string, params?: any) => void;
    reset?: (params: any) => void;
  };
  route?: {
    params?: {
      phoneNumber?: string;
      flow?: 'login';
    };
  };
}

export const OTPVerificationScreen: React.FC<OTPVerificationScreenProps> = ({
  navigation,
  route,
}) => {
  const phoneNumber = route?.params?.phoneNumber || '';
  const flow = route?.params?.flow || 'login';
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isVerifyingRef = useRef<boolean>(false);

  useEffect(() => {
    // Start countdown timer
    if (resendTimer > 0) {
      timerRef.current = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [resendTimer]);

  const handleOTPChange = (value: string) => {
    setOtp(value);
    setOtpError(false);
  };

  const verifyOTP = async (otpValue: string) => {
    
    try {
      const response = await authService.verifyOTP(phoneNumber, otpValue, flow);
      
      if (response.success) {
        setOtpError(false);
        // Navigate to Home after successful login
        navigation?.reset?.({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      } else {
        setOtpError(true);
        Alert.alert('Incorrect OTP', response.message || 'Please enter the correct OTP code.');
      }
    } catch (error: any) {
      setOtpError(true);
      Alert.alert('Error', error.message || 'Failed to verify OTP. Please try again.');
    }
  };

  const handleResendOTP = async () => {
    if (canResend) {
      try {
        const response = await authService.sendOTP(phoneNumber);
        
        if (response.success) {
          setResendTimer(60);
          setCanResend(false);
          setOtp('');
          setOtpError(false);
        } else {
          Alert.alert('Error', response.message || 'Failed to resend OTP');
        }
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to resend OTP. Please try again.');
      }
    }
  };

  const handleLogin = () => {
    if (otp.length === 6) {
      verifyOTP(otp);
    } else {
      setOtpError(true);
      Alert.alert('Incomplete OTP', 'Please enter all 6 digits.');
    }
  };

  const handleTermsPress = () => {
    setShowTermsModal(true);
  };

  const handlePrivacyPress = () => {
    setShowPrivacyModal(true);
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
            <Text style={styles.headerTitle}>Login</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Instruction Text */}
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>
              Please check your phone number & enter the OTP
            </Text>
          </View>

          {/* OTP Input */}
          <View style={styles.otpContainer}>
            <OTPInput
              length={6}
              value={otp}
              onChangeText={handleOTPChange}
              error={otpError}
              autoFocus
            />
          </View>

          {/* Resend OTP */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Haven't received OTP?</Text>
            {canResend ? (
              <TouchableOpacity onPress={handleResendOTP} activeOpacity={0.7}>
                <Text style={styles.resendLink}>Resend</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.resendTimer}>{resendTimer}s</Text>
            )}
          </View>

          {/* Terms and Conditions */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By continuing, you agree to our{' '}
              <Text style={styles.linkText} onPress={handleTermsPress}>
                Terms and Conditions
              </Text>
              {' & '}
              <Text style={styles.linkText} onPress={handlePrivacyPress}>
                Privacy Policy
              </Text>
            </Text>
          </View>

          {/* Login Button */}
          <View style={styles.loginButtonContainer}>
            <TouchableOpacity
              style={[
                styles.loginButton,
                otp.length !== 6 && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={otp.length !== 6}
            >
              <Text style={styles.loginButtonText}>Login</Text>
              <Text style={styles.loginButtonArrow}>→</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Terms and Conditions Modal */}
      <LegalDocumentModal
        visible={showTermsModal}
        title="Terms and Conditions"
        content={TERMS_AND_CONDITIONS_CONTENT}
        onClose={() => setShowTermsModal(false)}
      />

      {/* Privacy Policy Modal */}
      <LegalDocumentModal
        visible={showPrivacyModal}
        title="Privacy Policy"
        content={PRIVACY_POLICY_CONTENT}
        onClose={() => setShowPrivacyModal(false)}
      />
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
  instructionContainer: {
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xs,
  },
  instructionText: {
    ...Typography.body,
    color: Colors.light.text,
    lineHeight: 22,
  },
  otpContainer: {
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xs,
  },
  resendText: {
    ...Typography.body,
    color: Colors.light.text,
    marginRight: Spacing.xs,
  },
  resendLink: {
    ...Typography.body,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  resendTimer: {
    ...Typography.body,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  termsContainer: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xs,
  },
  termsText: {
    ...Typography.small,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  linkText: {
    color: Colors.light.primary,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  loginButtonContainer: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  loginButton: {
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
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    ...Typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: Spacing.sm,
  },
  loginButtonArrow: {
    marginBottom: 8,
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});


