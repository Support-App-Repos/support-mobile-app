/**
 * Phone Number Input Component with Country Code Selector
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Modal,
  FlatList,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../../config/theme';
import { filterNumbersOnly } from '../../utils/validation';

interface Country {
  code: string;
  dialCode: string;
  flag: string;
  name: string;
}

const COUNTRIES: Country[] = [
  { code: 'PK', dialCode: '+92', flag: '🇵🇰', name: 'Pakistan' },
  { code: 'US', dialCode: '+1', flag: '🇺🇸', name: 'United States' },
  { code: 'GB', dialCode: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: 'IN', dialCode: '+91', flag: '🇮🇳', name: 'India' },
  // Add more countries as needed
];

interface PhoneNumberInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  onGetCode?: () => void;
  error?: string;
  containerStyle?: ViewStyle;
  showGetCodeButton?: boolean;
  onCountryChange?: (countryCode: string, dialCode: string) => void;
  loading?: boolean;
}

export const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  label,
  value,
  onChangeText,
  onGetCode,
  error,
  containerStyle,
  showGetCodeButton = true,
  onCountryChange,
  loading = false,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const handleGetCode = () => {
    if (onGetCode && value.trim()) {
      onGetCode();
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error && styles.inputError]}>
        {/* Country Code Selector */}
        <TouchableOpacity
          style={styles.countrySelector}
          onPress={() => setShowCountryPicker(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.flag}>{selectedCountry.flag}</Text>
          <Text style={styles.dialCode}>{selectedCountry.dialCode}</Text>
          <Text style={styles.dropdownIcon}>▼</Text>
        </TouchableOpacity>

        {/* Phone Number Input */}
        <TextInput
          style={styles.phoneInput}
          placeholder="Enter phone number"
          placeholderTextColor={Colors.light.textSecondary}
          value={value}
          onChangeText={(text) => onChangeText(filterNumbersOnly(text, false))}
          keyboardType="phone-pad"
          maxLength={15}
        />

      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCountryPicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Country</Text>
            <FlatList
              data={COUNTRIES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryItem}
                  onPress={() => {
                    setSelectedCountry(item);
                    setShowCountryPicker(false);
                    if (onCountryChange) {
                      onCountryChange(item.code, item.dialCode);
                    }
                  }}
                >
                  <Text style={styles.countryFlag}>{item.flag}</Text>
                  <Text style={styles.countryName}>{item.name}</Text>
                  <Text style={styles.countryDialCode}>{item.dialCode}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
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
    paddingHorizontal: Spacing.sm,
    minHeight: 48,
  },
  inputError: {
    borderColor: Colors.light.error,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: Spacing.sm,
    borderRightWidth: 1,
    borderRightColor: Colors.light.border,
    marginRight: Spacing.sm,
  },
  flag: {
    fontSize: 20,
    marginRight: Spacing.xs,
  },
  dialCode: {
    ...Typography.body,
    color: Colors.light.text,
    fontWeight: '500',
    marginRight: Spacing.xs,
  },
  dropdownIcon: {
    fontSize: 10,
    color: Colors.light.textSecondary,
  },
  phoneInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.light.text,
    paddingVertical: Spacing.sm,
  },
  getCodeButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  getCodeText: {
    ...Typography.caption,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  getCodeTextDisabled: {
    color: Colors.light.textSecondary,
    opacity: 0.5,
  },
  errorText: {
    ...Typography.small,
    color: Colors.light.error,
    marginTop: Spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    maxHeight: '70%',
    paddingTop: Spacing.md,
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.light.text,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  countryFlag: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  countryName: {
    flex: 1,
    ...Typography.body,
    color: Colors.light.text,
  },
  countryDialCode: {
    ...Typography.body,
    color: Colors.light.textSecondary,
  },
});


