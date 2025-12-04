/**
 * OTP Input Component with 6 individual input boxes
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextInput as RNTextInput,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../../config/theme';

interface OTPInputProps {
  length?: number;
  value: string;
  onChangeText: (otp: string) => void;
  error?: boolean;
  containerStyle?: ViewStyle;
  autoFocus?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChangeText,
  error = false,
  containerStyle,
  autoFocus = false,
}) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<RNTextInput[]>([]);

  useEffect(() => {
    // Sync external value with internal state
    const newOtp = value.split('').slice(0, length);
    const paddedOtp = [...newOtp, ...Array(length - newOtp.length).fill('')];
    setOtp(paddedOtp);
  }, [value, length]);

  const handleChange = (text: string, index: number) => {
    // Only allow single digit
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    
    if (digit) {
      const newOtp = [...otp];
      newOtp[index] = digit;
      setOtp(newOtp);
      
      // Update parent component
      onChangeText(newOtp.join(''));
      
      // Auto-focus next input
      if (index < length - 1 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    } else {
      // Handle backspace
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      onChangeText(newOtp.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    // Select all text when focused
    inputRefs.current[index]?.setNativeProps({ selection: { start: 0, end: 1 } });
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {Array.from({ length }).map((_, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            if (ref) {
              inputRefs.current[index] = ref;
            }
          }}
          style={[
            styles.input,
            error && styles.inputError,
            otp[index] && styles.inputFilled,
          ]}
          value={otp[index]}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          onFocus={() => handleFocus(index)}
          keyboardType="number-pad"
          maxLength={1}
          selectTextOnFocus
          autoFocus={autoFocus && index === 0}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  input: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.background,
    ...Typography.h3,
    color: Colors.light.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  inputFilled: {
    borderColor: '#49B66F', // Light green border when filled
  },
  inputError: {
    borderColor: Colors.light.error,
    borderWidth: 2,
  },
});


