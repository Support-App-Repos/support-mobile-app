import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { ListingCard, type ListingCardData } from './ListingCard';
import { Colors, Spacing } from '../../config/theme';

const MP = Colors.light.marketplace;
/** Figma listing card width ~180px */
const FEED_CARD_WIDTH = 180;

type HomeListingSectionProps = {
  title: string;
  listings: ListingCardData[];
  navigation?: any;
  isWishlisted: (id: string) => boolean;
  onToggleWishlist: (id: string) => void;
  onSeeAll?: () => void;
  onListingPress?: (listing: ListingCardData) => void;
};

export const HomeListingSection: React.FC<HomeListingSectionProps> = ({
  title,
  listings,
  navigation,
  isWishlisted,
  onToggleWishlist,
  onSeeAll,
  onListingPress,
}) => {
  if (listings.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        {onSeeAll ? (
          <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7} hitSlop={8}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {listings.map((listing) => (
          <View key={listing.id} style={styles.cardWrap}>
            <ListingCard
              listing={listing}
              variant="feed"
              navigation={navigation}
              onPress={onListingPress}
              wishlisted={isWishlisted(listing.id)}
              onToggleWishlist={(id) => onToggleWishlist(id)}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22.4,
    color: MP.titleText,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19.5,
    color: MP.primary,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: 12,
    paddingBottom: 4,
  },
  cardWrap: {
    width: FEED_CARD_WIDTH,
  },
});
