/**
 * Phone Number Input Component with Country Code Selector
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Keyboard,
} from 'react-native';
import type { CountryItem } from 'react-native-country-codes-picker/types/Types';
import { countryCodes } from 'react-native-country-codes-picker/constants/countryCodes';
import { Colors, Spacing, BorderRadius, Typography } from '../../config/theme';
import { filterNumbersOnly } from '../../utils/validation';

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
  defaultCountryCode?: string; // e.g. "PK", "AE"
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
  defaultCountryCode = 'PK',
}) => {
  const didUserSelectCountryRef = useRef(false);
  const [showPicker, setShowPicker] = useState(false);

  const initialCountry: CountryItem | undefined = useMemo(() => {
    const cca2 = String(defaultCountryCode || '').toUpperCase();
    return countryCodes.find((c) => String(c.code).toUpperCase() === cca2);
  }, [defaultCountryCode]);

  const [selected, setSelected] = useState<CountryItem | undefined>(initialCountry);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (didUserSelectCountryRef.current) return;
    if (!initialCountry) return;
    setSelected(initialCountry);
    onCountryChange?.(initialCountry.code, initialCountry.dial_code);
  }, [initialCountry, onCountryChange]);

  const filteredCountries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return countryCodes;
    return countryCodes.filter((c) => {
      const name = (c?.name?.en || '').toLowerCase();
      const dial = String(c?.dial_code || '').toLowerCase();
      const code = String(c?.code || '').toLowerCase();
      return name.includes(q) || dial.includes(q) || code.includes(q);
    });
  }, [search]);

  const handleGetCode = () => {
    if (onGetCode && value.trim()) {
      onGetCode();
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error && styles.inputError]}>
        <TouchableOpacity
          style={styles.countryButton}
          onPress={() => {
            setSearch('');
            setShowPicker(true);
          }}
          activeOpacity={0.7}
          accessibilityRole="button"
        >
          <Text style={styles.flag}>{selected?.flag || '🏳️'}</Text>
          <Text style={styles.dialCode}>{selected?.dial_code || ''}</Text>
          <Text style={styles.dropdownIcon}>▼</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.phoneTextInput}
          placeholder="Enter phone number"
          placeholderTextColor={Colors.light.textSecondary}
          value={value}
          onChangeText={(text) => onChangeText(filterNumbersOnly(text, false))}
          keyboardType="phone-pad"
          maxLength={15}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setShowPicker(false)}
        >
          <TouchableOpacity
            style={styles.pickerSheet}
            activeOpacity={1}
            onPress={() => {}}
          >
            <Text style={styles.pickerTitle}>Select country</Text>
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search country"
              placeholderTextColor={Colors.light.textSecondary}
              autoCorrect={false}
              autoCapitalize="none"
              onSubmitEditing={Keyboard.dismiss}
              returnKeyType="search"
            />

            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => String(item.code)}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    didUserSelectCountryRef.current = true;
                    setSelected(item);
                    setShowPicker(false);
                    onCountryChange?.(item.code, item.dial_code);
                  }}
                >
                  <Text style={styles.countryFlag}>{item.flag}</Text>
                  <Text style={styles.countryName} numberOfLines={1}>
                    {item?.name?.en || item.code}
                  </Text>
                  <Text style={styles.countryDial}>{item.dial_code}</Text>
                </TouchableOpacity>
              )}
            />
          </TouchableOpacity>
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
    minHeight: 48,
    overflow: 'hidden',
  },
  inputError: {
    borderColor: Colors.light.error,
  },
  countryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    height: 48,
    borderRightWidth: 1,
    borderRightColor: Colors.light.border,
    gap: Spacing.xs,
  },
  flag: {
    fontSize: 18,
  },
  dialCode: {
    ...Typography.body,
    color: Colors.light.text,
    fontWeight: '600',
  },
  dropdownIcon: {
    fontSize: 10,
    color: Colors.light.textSecondary,
    marginLeft: 2,
  },
  phoneTextInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.light.text,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 0,
    height: 48,
  },
  errorText: {
    ...Typography.small,
    color: Colors.light.error,
    marginTop: Spacing.xs,
  },
  pickerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  pickerSheet: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    maxHeight: '75%',
  },
  pickerTitle: {
    ...Typography.h3,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    color: Colors.light.text,
    backgroundColor: Colors.light.surface,
    marginBottom: Spacing.sm,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    gap: Spacing.sm,
  },
  countryFlag: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  countryName: {
    flex: 1,
    ...Typography.body,
    color: Colors.light.text,
  },
  countryDial: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
});


