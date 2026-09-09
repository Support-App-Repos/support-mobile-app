import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ForwardIcon } from '../../common';
import { Colors, BorderRadius } from '../../../config/theme';

type ListingCategoryCardProps = {
  title: string;
  subtitle: string;
  emoji: string;
  iconBackgroundColor: string;
  chevronBackgroundColor: string;
  chevronColor: string;
  onPress: () => void;
};

export const ListingCategoryCard: React.FC<ListingCategoryCardProps> = ({
  title,
  subtitle,
  emoji,
  iconBackgroundColor,
  chevronBackgroundColor,
  chevronColor,
  onPress,
}) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
    <View style={[styles.emojiTile, { backgroundColor: iconBackgroundColor }]}>
      <Text style={styles.emoji}>{emoji}</Text>
    </View>
    <View style={styles.textBlock}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
    <View style={[styles.chevronCircle, { backgroundColor: chevronBackgroundColor }]}>
      <ForwardIcon size={16} color={chevronColor} />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.xl,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  emojiTile: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 30,
    lineHeight: 36,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
    color: Colors.light.textHeading,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
    color: '#999999',
    marginTop: 2,
  },
  chevronCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
