/**
 * Form select — bottom-sheet picker used in listing and store forms
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ViewStyle,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../../config/theme';

export interface FormSelectProps {
  label: string;
  required?: boolean;
  value: string;
  placeholder: string;
  options: string[];
  onSelect: (value: string) => void;
  containerStyle?: ViewStyle;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  required,
  value,
  placeholder,
  options,
  onSelect,
  containerStyle,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={[styles.fieldFlex, containerStyle]}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
      ) : null}
      <TouchableOpacity
        style={styles.selectTrigger}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.selectText, !value && styles.selectPlaceholder]} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Text style={styles.selectChevron}>▼</Text>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>{label || 'Select'}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalRow, value === item && styles.modalRowActive]}
                  onPress={() => {
                    onSelect(item);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.modalRowText, value === item && styles.modalRowTextActive]}>
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
  fieldFlex: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    ...Typography.body,
    color: Colors.light.text,
    fontWeight: '500',
    marginBottom: Spacing.xs,
    fontSize: 14,
  },
  required: {
    color: '#EF4444',
  },
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    minHeight: 44,
  },
  selectText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
  },
  selectPlaceholder: {
    color: Colors.light.textSecondary,
  },
  selectChevron: {
    fontSize: 10,
    color: Colors.light.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    maxHeight: '55%',
    paddingBottom: Spacing.lg,
  },
  modalTitle: {
    ...Typography.h3,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalRow: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  modalRowActive: {
    backgroundColor: '#F3F4F6',
  },
  modalRowText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  modalRowTextActive: {
    fontWeight: '600',
    color: Colors.light.primary,
  },
});
