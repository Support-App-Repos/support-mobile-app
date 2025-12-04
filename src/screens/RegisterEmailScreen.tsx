/**
 * Register Email Screen (Create Account via Email/Password)
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
import { Checkbox } from '../components/common/Checkbox';
import { Colors, Spacing, BorderRadius, Typography } from '../config/theme';
import { isValidEmail } from '../utils/validation';
import { authService } from '../services';

interface RegisterEmailScreenProps {
  navigation?: {
    goBack?: () => void;
    navigate?: (screen: string, params?: any) => void;
  };
}

export const RegisterEmailScreen: React.FC<RegisterEmailScreenProps> = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    terms?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!termsAccepted) {
      newErrors.terms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (validateForm()) {
      // Clear previous errors
      setErrors({});
      
      try {
        console.log('Attempting registration with:', {
          email: email.trim(),
          username: `${firstName} ${lastName}`.trim(),
        });

        const response = await authService.signup({
          email: email.trim(),
          password,
          username: `${firstName} ${lastName}`.trim(),
          location: '', // Add location field if needed
        });
        
        console.log('Registration response:', response);
        
        if (response.success && response.token) {
          // Navigate to Home after successful registration
          console.log('Registration successful, navigating to Home');
          navigation?.navigate?.('Home');
        } else {
          const errorMsg = response.message || 'Registration failed. Please check your information and try again.';
          console.error('Registration failed:', errorMsg);
          setErrors({ email: errorMsg });
        }
      } catch (error: any) {
        console.error('Registration error:', error);
        
        // Handle different error types
        let errorMessage = 'Registration failed. Please try again.';
        
        if (error.message) {
          // 401 Unauthorized errors - show the actual API error message
          if (error.message.includes('401') || error.message.includes('Unauthorized') || error.message.includes('Authentication failed')) {
            // Use the error message from API if available, otherwise show generic message
            errorMessage = error.message.includes('contact support') 
              ? error.message 
              : 'Authentication failed. Please check your credentials or contact support.';
          }
          // Network errors
          else if (error.message.includes('Network error') || error.message.includes('Unable to connect')) {
            errorMessage = 'Unable to connect to server. Please check:\n• Your internet connection\n• The API server is running\n• The API URL is correct in your configuration';
          } 
          // JSON parse errors
          else if (error.message.includes('JSON Parse error')) {
            errorMessage = 'Server response error. Please contact support if this persists.';
          } 
          // Other errors
          else {
            errorMessage = error.message;
          }
        }
        
        setErrors({ email: errorMessage });
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
              Enter email and set password to create your account
            </Text>
          </View>

          {/* Form Fields */}
          <Input
            label="First Name*"
            placeholder="Enter First Name"
            value={firstName}
            onChangeText={(text) => {
              setFirstName(text);
              if (errors.firstName) {
                setErrors({ ...errors, firstName: undefined });
              }
            }}
            error={errors.firstName}
            autoCapitalize="words"
          />

          <Input
            label="Last Name*"
            placeholder="Enter Last Name"
            value={lastName}
            onChangeText={(text) => {
              setLastName(text);
              if (errors.lastName) {
                setErrors({ ...errors, lastName: undefined });
              }
            }}
            error={errors.lastName}
            autoCapitalize="words"
          />

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

          <PasswordInput
            label="Password*"
            placeholder="Enter Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) {
                setErrors({ ...errors, password: undefined });
              }
            }}
            error={errors.password}
          />

          {/* Marketing Opt-in Checkbox */}
          <Checkbox
            checked={marketingOptIn}
            onToggle={setMarketingOptIn}
            labelComponent={
              <Text style={styles.checkboxLabel}>
                We will send you emails regarding our services, offers, competitions and carefully selected partners. These emails will always be sent by us and you can unsubscribe from receiving these marketing emails at any time.
              </Text>
            }
            containerStyle={styles.checkboxContainer}
          />

          {/* Terms and Conditions Checkbox */}
          <View style={styles.checkboxContainer}>
            <Checkbox
              checked={termsAccepted}
              onToggle={(value) => {
                setTermsAccepted(value);
                // Clear terms error when checkbox is toggled
                if (value && errors.terms) {
                  setErrors({ ...errors, terms: undefined });
                }
              }}
              labelComponent={
                <Text style={styles.checkboxLabel}>
                  By continuing, you agree to our{' '}
                  <Text 
                    style={styles.linkText} 
                    onPress={() => {
                      handleTermsPress();
                    }}
                  >
                    Terms and Conditions
                  </Text>
                  {' & '}
                  <Text 
                    style={styles.linkText} 
                    onPress={() => {
                      handlePrivacyPress();
                    }}
                  >
                    Privacy Policy
                  </Text>
                </Text>
              }
            />
          </View>
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


