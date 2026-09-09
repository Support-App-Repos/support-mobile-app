import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { BackIcon, BellIcon } from '../../common';
import { Colors, Spacing, Typography } from '../../../config/theme';

type ListingWizardHeaderProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  profileImageUrl?: string | null;
  onBack: () => void;
  onProfilePress?: () => void;
  showBell?: boolean;
  onBellPress?: () => void;
  /** Figma category picker: back/profile in #F5F7FA circles */
  usePillControls?: boolean;
};

export const ListingWizardHeader: React.FC<ListingWizardHeaderProps> = ({
  title,
  subtitle,
  eyebrow,
  profileImageUrl,
  onBack,
  onProfilePress,
  showBell = true,
  onBellPress,
  usePillControls = false,
}) => {
  const resolvedProfileUri =
    typeof profileImageUrl === 'string' && profileImageUrl.trim()
      ? profileImageUrl.trim()
      : 'https://i.pravatar.cc/150?img=12';

  return (
  <View style={styles.wrap}>
    <View style={styles.row}>
      <TouchableOpacity
        style={[styles.backButton, usePillControls && styles.pillControl]}
        onPress={onBack}
        activeOpacity={0.7}
      >
        <BackIcon size={usePillControls ? 18 : 24} color="#030303" />
      </TouchableOpacity>
      <View style={styles.right}>
        {showBell ? (
          <TouchableOpacity
            style={[styles.iconButton, usePillControls && styles.pillControl]}
            onPress={onBellPress}
            activeOpacity={0.7}
          >
            <BellIcon size={usePillControls ? 16 : 24} color="#111827" />
          </TouchableOpacity>
        ) : null}
        {onProfilePress ? (
          <TouchableOpacity
            style={[styles.profileButton, usePillControls && styles.pillProfileButton]}
            onPress={onProfilePress}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: resolvedProfileUri }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
    {(eyebrow || title || subtitle) && (
      <View style={styles.titles}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    )}
  </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: Spacing.xs,
    marginLeft: -Spacing.xs,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconButton: {
    padding: Spacing.xs,
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.cardBorder,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  titles: {
    marginTop: Spacing.sm,
  },
  eyebrow: {
    ...Typography.stepEyebrow,
    color: Colors.light.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    ...Typography.listingTitle,
    color: Colors.light.textHeading,
  },
  subtitle: {
    ...Typography.body,
    color: '#888888',
    fontSize: 13,
    lineHeight: 19.5,
    marginTop: 4,
  },
  pillControl: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    marginLeft: 0,
  },
  pillProfileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 0,
    backgroundColor: '#F5F7FA',
  },
});
