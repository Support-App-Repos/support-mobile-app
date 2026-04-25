/**
 * Price Type Dropdown Component
 *
 * Uses an inline expandable list (no Modal) so taps work reliably inside
 * ScrollView + native stack screens on Android and iOS.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../../config/theme';

export type PriceType = 'Free' | 'Paid' | 'Per Seat' | 'Per Hour';

const PRICE_TYPES: PriceType[] = ['Free', 'Paid', 'Per Seat', 'Per Hour'];

interface PriceTypeDropdownProps {
  value: PriceType | null;
  onSelect: (priceType: PriceType) => void;
  style?: any;
  /** Lets the parent raise this row above the next fields while the menu is open. */
  onOpenChange?: (open: boolean) => void;
}

export const PriceTypeDropdown: React.FC<PriceTypeDropdownProps> = ({
  value,
  onSelect,
  style,
  onOpenChange,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <View
      style={[
        styles.dropdownRoot,
        showPicker && styles.dropdownRootOpen,
        style,
      ]}
      collapsable={false}
    >
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => {
          Keyboard.dismiss();
          setShowPicker((open) => {
            const next = !open;
            onOpenChange?.(next);
            return next;
          });
        }}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ expanded: showPicker }}
      >
        <Text style={[styles.dropdownText, !value && styles.placeholder]}>
          {value || 'Select price type'}
        </Text>
        <Text style={styles.dropdownIcon}>{showPicker ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {showPicker ? (
        <View style={styles.optionsPanel} accessibilityViewIsModal>
          {PRICE_TYPES.map((item, index) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.optionItem,
                index === PRICE_TYPES.length - 1 && styles.optionItemLast,
                value === item && styles.optionItemSelected,
              ]}
              onPress={() => {
                onSelect(item);
                setShowPicker(false);
                onOpenChange?.(false);
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.optionText,
                  value === item && styles.optionTextSelected,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownRoot: {
    alignSelf: 'stretch',
    position: 'relative',
    zIndex: 0,
  },
  dropdownRootOpen: {
    zIndex: 100,
    elevation: 12,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 44,
  },
  dropdownText: {
    ...Typography.body,
    color: Colors.light.text,
    fontSize: 14,
    flex: 1,
  },
  placeholder: {
    color: Colors.light.textSecondary,
  },
  dropdownIcon: {
    fontSize: 10,
    color: Colors.light.textSecondary,
    marginLeft: Spacing.sm,
  },
  optionsPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '100%',
    marginTop: Spacing.xs,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  optionItem: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  optionItemLast: {
    borderBottomWidth: 0,
  },
  optionItemSelected: {
    backgroundColor: '#F0F9FF',
  },
  optionText: {
    ...Typography.body,
    color: Colors.light.text,
    fontSize: 16,
  },
  optionTextSelected: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
});
