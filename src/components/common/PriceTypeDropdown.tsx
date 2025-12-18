/**
 * Price Type Dropdown Component
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../../config/theme';

export type PriceType = 'Free' | 'Paid' | 'Per Seat' | 'Per Hour';

const PRICE_TYPES: PriceType[] = ['Free', 'Paid', 'Per Seat', 'Per Hour'];

interface PriceTypeDropdownProps {
  value: PriceType | null;
  onSelect: (priceType: PriceType) => void;
  style?: any;
}

export const PriceTypeDropdown: React.FC<PriceTypeDropdownProps> = ({
  value,
  onSelect,
  style,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <View style={style}>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setShowPicker(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.dropdownText, !value && styles.placeholder]}>
          {value || 'Select price type'}
        </Text>
        <Text style={styles.dropdownIcon}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPicker(false)}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <Text style={styles.modalTitle}>Select Price Type</Text>
            <FlatList
              data={PRICE_TYPES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    value === item && styles.optionItemSelected,
                  ]}
                  onPress={() => {
                    onSelect(item);
                    setShowPicker(false);
                  }}
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
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    maxHeight: '50%',
    paddingTop: Spacing.lg,
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.light.text,
    fontWeight: '600',
    fontSize: 18,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  optionItem: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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

