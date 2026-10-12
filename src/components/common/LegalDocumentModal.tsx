/**
 * Legal Document Modal Component
 * Displays Terms and Conditions or Privacy Policy in a scrollable modal
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../../config/theme';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

interface LegalDocumentModalProps {
  visible: boolean;
  title: string;
  content: string;
  onClose: () => void;
}

export const LegalDocumentModal: React.FC<LegalDocumentModalProps> = ({
  visible,
  title,
  content,
  onClose,
}) => {
  if (!visible) return null;

  // Function to render content with bold headings / subheadings
  const renderFormattedContent = (text: string) => {
    if (!text) return <Text style={styles.content}>No content available</Text>;

    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const nextLine = lines[i + 1];
      const prevLine = lines[i - 1];
      const trimmed = line.trim();
      const isEmpty = trimmed === '';

      // Skip divider lines
      if (
        trimmed === '⸻' ||
        trimmed === '---' ||
        trimmed === '—' ||
        trimmed === '-----'
      ) {
        continue;
      }

      // Explicit markdown-style headings: # Heading / ## Subheading
      if (trimmed.startsWith('## ')) {
        elements.push(
          <Text key={`subheading-${i}`} style={styles.subheading}>
            {trimmed.slice(3).trim()}
            {'\n'}
          </Text>
        );
        continue;
      }
      if (trimmed.startsWith('# ')) {
        elements.push(
          <Text key={`heading-${i}`} style={styles.heading}>
            {trimmed.slice(2).trim()}
            {'\n'}
          </Text>
        );
        continue;
      }

      const isBulletPoint =
        trimmed.startsWith('•') ||
        trimmed.startsWith('-') ||
        trimmed.startsWith('*');
      const isLongLine = line.length > 100;
      const hasNextContent = nextLine && nextLine.trim() !== '';
      const isAfterEmptyLine = !prevLine || prevLine.trim() === '';

      if (
        !isEmpty &&
        !isBulletPoint &&
        !isLongLine &&
        hasNextContent &&
        isAfterEmptyLine &&
        line.length < 80
      ) {
        const headingText = trimmed.endsWith(':') ? trimmed : `${trimmed}:`;
        elements.push(
          <Text key={`heading-${i}`} style={styles.heading}>
            {headingText}
            {'\n'}
          </Text>
        );
      } else if (!isEmpty) {
        elements.push(
          <Text key={`content-${i}`} style={styles.content}>
            {line}
            {i < lines.length - 1 ? '\n' : ''}
          </Text>
        );
      } else {
        elements.push(
          <Text key={`empty-${i}`} style={styles.content}>
            {'\n'}
          </Text>
        );
      }
    }

    return <Text selectable={true}>{elements}</Text>;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlayTouchable} />
        </TouchableWithoutFeedback>
        
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            bounces={true}
          >
            {renderFormattedContent(content)}
          </ScrollView>

          {/* Footer Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.button}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.lg,
    width: SCREEN_WIDTH * 0.9,
    maxWidth: 500,
    height: SCREEN_HEIGHT * 0.8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    minHeight: 60,
  },
  title: {
    color: Colors.light.text,
    fontWeight: '700',
    fontSize: 20,
    flex: 1,
    marginRight: Spacing.sm,
    includeFontPadding: false,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.md,
  },
  closeButtonText: {
    fontSize: 18,
    color: Colors.light.text,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  content: {
    ...Typography.body,
    color: Colors.light.text,
    lineHeight: 22,
    fontSize: 14,
  },
  heading: {
    ...Typography.h3,
    color: Colors.light.text,
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 26,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  subheading: {
    ...Typography.h3,
    color: Colors.light.text,
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    height: 80,
  },
  button: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    includeFontPadding: false,
  },
});
