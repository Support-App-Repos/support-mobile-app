/**
 * Login Screen
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input, SegmentedControl, PhoneNumberInput, OTPInput, LegalDocumentModal } from '../components/common';
import { PasswordInput } from '../components/common/PasswordInput';
import { Colors, Spacing, BorderRadius, Typography } from '../config/theme';
import { authService } from '../services';
import { TERMS_AND_CONDITIONS_CONTENT, PRIVACY_POLICY_CONTENT } from '../constants';

interface LoginScreenProps {
  navigation?: {
    goBack?: () => void;
    navigate?: (screen: string, params?: any) => void;
  };
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [loginMethod, setLoginMethod] = useState<'OTP' | 'Password'>('OTP');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+92'); // Default to Pakistan
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const handleGetCode = async () => {
    // Validate phone number
    if (!phoneNumber.trim()) {
      setPhoneError('Phone number is required');
      return;
    }
    if (phoneNumber.trim().length < 10) {
      setPhoneError('Please enter a valid phone number');
      return;
    }
    setPhoneError('');
    
    // Combine country code with phone number
    const fullPhoneNumber = `${countryCode}${phoneNumber.replace(/\D/g, '')}`;
    
    try {
      const response = await authService.sendOTP(fullPhoneNumber);
      
      if (response.success) {
        setOtpSent(true);
        setResendTimer(60);
        setCanResend(false);
      } else {
        setPhoneError(response.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      setPhoneError(error.message || 'Failed to send OTP. Please try again.');
    }
  };

  const handleOTPChange = (value: string) => {
    setOtp(value);
    setOtpError(false);
    
    // Auto-verify when 6 digits are entered
    if (value.length === 6) {
      verifyOTP(value);
    }
  };

  const verifyOTP = async (otpValue: string) => {
    // Combine country code with phone number
    const fullPhoneNumber = `${countryCode}${phoneNumber.replace(/\D/g, '')}`;
    
    try {
      const response = await authService.verifyOTP(fullPhoneNumber, otpValue, 'login');
      
      if (response.success && response.token) {
        setOtpError(false);
        // Navigate to Home after successful login
        navigation?.navigate?.('Home');
      } else {
        setOtpError(true);
      }
    } catch (error: any) {
      setOtpError(true);
      console.error('OTP verification error:', error);
    }
  };

  const handleResendOTP = async () => {
    if (canResend) {
      // Combine country code with phone number
      const fullPhoneNumber = `${countryCode}${phoneNumber.replace(/\D/g, '')}`;
      
      try {
        const response = await authService.sendOTP(fullPhoneNumber);
        
        if (response.success) {
          setResendTimer(60);
          setCanResend(false);
          setOtp('');
          setOtpError(false);
        }
      } catch (error: any) {
        console.error('Resend OTP error:', error);
      }
    }
  };

  // Countdown timer for resend OTP
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (otpSent && resendTimer > 0) {
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
  }, [otpSent, resendTimer]);

  const handleLogin = async () => {
    if (loginMethod === 'OTP') {
      if (!otpSent) {
        handleGetCode();
        return;
      }
      // If OTP is sent, verify it
      if (otp.length === 6) {
        verifyOTP(otp);
      }
      return;
    }

    // Validate email for password login
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }
    if (!email.includes('@')) {
      setEmailError('Please enter a valid email');
      return;
    }
    if (!password.trim()) {
      setEmailError('Password is required');
      return;
    }
    setEmailError('');
    
    try {
      const response = await authService.signin(email.trim(), password);
      
      if (response.success && response.token) {
        // Navigate to Home after successful login
        navigation?.navigate?.('Home');
      } else {
        setEmailError(response.message || 'Login failed. Please check your credentials.');
      }
    } catch (error: any) {
      setEmailError(error.message || 'Login failed. Please try again.');
    }
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password screen
    navigation?.navigate?.('ForgotPassword');
  };

  const handleRegister = () => {
    // Navigate to email registration screen
    navigation?.navigate?.('RegisterEmail');
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
            <Text style={styles.headerTitle}>Login</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Login Method Selector */}
          <View style={styles.segmentedContainer}>
            <SegmentedControl
              options={['OTP', 'Password']}
              selectedIndex={loginMethod === 'OTP' ? 0 : 1}
              onSelect={(index) => setLoginMethod(index === 0 ? 'OTP' : 'Password')}
            />
          </View>

          {/* Phone Number Input (OTP method) */}
          {loginMethod === 'OTP' && !otpSent && (
            <PhoneNumberInput
              label="Phone Number*"
              value={phoneNumber}
              onChangeText={(text) => {
                setPhoneNumber(text);
                if (phoneError) setPhoneError('');
              }}
              onGetCode={handleGetCode}
              onCountryChange={(code, dialCode) => setCountryCode(dialCode)}
              error={phoneError}
            />
          )}

          {/* OTP Input Section (shown after Get Code is clicked) */}
          {loginMethod === 'OTP' && otpSent && (
            <>
              <View style={styles.instructionContainer}>
                <Text style={styles.instructionText}>
                  Please check your phone number & enter the OTP
                </Text>
              </View>

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
            </>
          )}

          {/* Email Input (Password method) */}
          {loginMethod === 'Password' && (
            <Input
              label="Email*"
              placeholder="Enter Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError('');
              }}
              error={emailError}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          )}

          {/* Password Input (shown when Password method is selected) */}
          {loginMethod === 'Password' && (
            <>
              <PasswordInput
                label="Enter Password"
                placeholder="Enter Password"
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={handleForgotPassword}
                style={styles.forgotPasswordContainer}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </>
          )}

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
                loginMethod === 'OTP' && otpSent && otp.length !== 6 && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={loginMethod === 'OTP' && otpSent && otp.length !== 6}
            >
              <Text style={styles.loginButtonText}>Login</Text>
              <Text style={styles.loginButtonArrow}>→</Text>
            </TouchableOpacity>
          </View>

          {/* Register Link */}
          {loginMethod === 'Password' &&
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>
              Don't have an account?{' '}
              <Text style={styles.registerLink} onPress={handleRegister}>
                Register
              </Text>
            </Text>
          </View>
          }
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
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xs,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.light.text,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 40,
  },
  segmentedContainer: {
    marginBottom: Spacing.lg,
  },
  instructionContainer: {
    marginBottom: Spacing.md,
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
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
  },
  forgotPasswordText: {
    ...Typography.caption,
    color: Colors.light.primary,
    fontWeight: '500',
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
  },
  loginButtonContainer: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
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
  registerContainer: {
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  registerText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
  },
  registerLink: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
});

