/**
 * Delete listing confirmation modal (Figma 1070:5075)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { DeleteIcon } from '../common';
import { Colors, BorderRadius } from '../../config/theme';

type DeleteListingModalProps = {
  visible: boolean;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export const DeleteListingModal: React.FC<DeleteListingModalProps> = ({
  visible,
  loading = false,
  onCancel,
  onConfirm,
}) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
    <Pressable style={styles.overlay} onPress={loading ? undefined : onCancel}>
      <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
        <View style={styles.iconCircle}>
          <DeleteIcon size={26} color="#EF4444" />
        </View>

        <Text style={styles.title}>Delete Listing?</Text>
        <Text style={styles.message}>
          This action cannot be undone. Your listing will be permanently removed and no longer
          visible to buyers.
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={onConfirm}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.deleteButtonText}>Yes, Delete</Text>
            )}
          </TouchableOpacity>
        </View>
      </Pressable>
    </Pressable>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 311,
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.xl,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  title: {
    fontSize: 18,
    lineHeight: 27,
    fontWeight: '700',
    color: Colors.light.marketplace.titleText,
    marginTop: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 13,
    lineHeight: 20,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.18,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.background,
  },
  cancelButtonText: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
    color: '#6B7280',
  },
  deleteButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  deleteButtonText: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
