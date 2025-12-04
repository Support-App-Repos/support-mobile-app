/**
 * Password Input Component with Visibility Toggle
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { VisibilityIcon } from './VisibilityIcon';
import { VisibilityOffIcon } from './VisibilityOffIcon';
import { Colors, Spacing, BorderRadius, Typography } from '../../config/theme';

interface PasswordInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  containerStyle?: ViewStyle;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  placeholder = 'Enter Password',
  value,
  onChangeText,
  error,
  containerStyle,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error && styles.inputError]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.light.textSecondary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!isVisible}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          onPress={() => setIsVisible(!isVisible)}
          style={styles.eyeIcon}
          activeOpacity={0.7}
        >
          {isVisible ? (
            <VisibilityIcon size={24} color={Colors.light.textSecondary} />
          ) : (
            <VisibilityOffIcon size={24} color={Colors.light.textSecondary} />
          )}
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.caption,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.surface,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.light.text,
    paddingVertical: Spacing.sm,
  },
  inputError: {
    borderColor: Colors.light.error,
  },
  eyeIcon: {
    padding: Spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...Typography.small,
    color: Colors.light.error,
    marginTop: Spacing.xs,
  },
});

