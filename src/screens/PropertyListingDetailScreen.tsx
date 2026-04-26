/**
 * Property Listing Detail Screen — property category viewer layout
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  Linking,
  FlatList,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BackIcon,
  SearchIcon,
  ShareIcon,
  SaveIcon,
  ReportIcon,
  LocationIcon,
  EmailContactIcon,
  CallContactIcon,
  WhatsAppContactIcon,
  PropertyAmenityIcon,
} from '../components/common';
import { Colors, Spacing, Typography, BorderRadius } from '../config/theme';
import { listingService, profileService } from '../services';
import { formatListingPrice } from '../utils/currency';
import { parseStoredAmenities } from '../constants/propertyAmenities';

const { width: SCREEN_W } = Dimensions.get('window');
const HERO_H = 280;

type PropertyListingDetailScreenProps = {
  navigation?: any;
  route?: {
    params?: {
      listingId?: string;
    };
  };
};

function formatViews(views?: number) {
  if (!views) return '0 views';
  if (views === 1) return '1 view';
  if (views >= 100000) return `${(views / 1000).toFixed(0)}K+ views`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
  return `${views} views`;
}

function formatListingDate(iso?: string | Date | null): string {
  if (!iso) return '—';
  try {
    const d = typeof iso === 'string' ? new Date(iso) : iso;
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return '—';
  }
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (value == null || String(value).trim() === '') return null;
  return (
    <View style={styles.kvRow}>
      <Text style={styles.kvLabel}>{label}</Text>
      <Text style={styles.kvValue}>{value}</Text>
    </View>
  );
}

export const PropertyListingDetailScreen: React.FC<PropertyListingDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const listingId = route?.params?.listingId;

  const onHeroViewable = useRef(({ viewableItems }: any) => {
    const i = viewableItems?.[0]?.index;
    if (typeof i === 'number') setHeroIndex(i);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 60 }).current;

  const checkWishlistStatus = async () => {
    if (!listingId) return;
    try {
      const response = await profileService.getWishlist();
      if (response.success) {
        const wishlistData = (response.data as any)?.data || response.data || [];
        const isInWishlist =
          Array.isArray(wishlistData) &&
          wishlistData.some(
            (item: any) =>
              item.id === listingId || item._id === listingId || item.listingId === listingId,
          );
        setSaved(isInWishlist);
      }
    } catch (e) {
      console.error('Wishlist check:', e);
    }
  };

  useEffect(() => {
    if (listingId) fetchListing();
  }, [listingId]);

  const fetchListing = async () => {
    if (!listingId) return;
    try {
      setLoading(true);
      const response = await listingService.getListingById(listingId);
      if (response.success) {
        const data = (response.data as any)?.data || response.data;
        setListing(data);
        checkWishlistStatus();
      } else {
        Alert.alert('Error', 'Failed to load listing');
        navigation?.goBack();
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to load listing');
      navigation?.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!listingId || saving) return;
    try {
      setSaving(true);
      if (saved) {
        const res = await profileService.removeFromWishlist(listingId);
        if (res.success) setSaved(false);
        else Alert.alert('Error', 'Could not update wishlist');
      } else {
        const res = await profileService.addToWishlist(listingId);
        if (res.success) setSaved(true);
        else {
          const msg = (res.data as any)?.message;
          if (msg?.includes('already')) setSaved(true);
          else Alert.alert('Error', msg || 'Could not save');
        }
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update wishlist');
    } finally {
      setSaving(false);
    }
  };

  const openMail = useCallback(() => {
    const email = listing?.user?.email || listing?.organizerEmail;
    if (!email) {
      Alert.alert('Unavailable', 'Seller email is not available.');
      return;
    }
    Linking.openURL(`mailto:${email}`).catch(() => Alert.alert('Error', 'Could not open email.'));
  }, [listing]);

  const openCall = useCallback(() => {
    const phone = listing?.user?.phoneNumber || listing?.organizerContact || listing?.serviceProviderContact;
    if (!phone) {
      Alert.alert('Unavailable', 'Phone number is not available.');
      return;
    }
    const cleaned = String(phone).replace(/[^\d+]/g, '');
    Linking.openURL(`tel:${cleaned}`).catch(() => Alert.alert('Error', 'Could not start call.'));
  }, [listing]);

  const openWhatsApp = useCallback(() => {
    const phone = listing?.user?.phoneNumber || listing?.organizerContact;
    if (!phone) {
      Alert.alert('Unavailable', 'Phone number is not available for WhatsApp.');
      return;
    }
    const digits = String(phone).replace(/\D/g, '');
    if (!digits) {
      Alert.alert('Unavailable', 'Invalid phone for WhatsApp.');
      return;
    }
    Linking.openURL(`https://wa.me/${digits}`).catch(() => Alert.alert('Error', 'Could not open WhatsApp.'));
  }, [listing]);

  const openInGoogleMaps = useCallback(() => {
    const address = listing?.location;
    if (!address) {
      Alert.alert('Unavailable', 'Location is not available.');
      return;
    }

    const google = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    const apple = `http://maps.apple.com/?q=${encodeURIComponent(address)}`;

    Linking.openURL(google).catch(() => {
      if (Platform.OS === 'ios') {
        Linking.openURL(apple).catch(() => Alert.alert('Error', 'Could not open Maps.'));
      } else {
        Alert.alert('Error', 'Could not open Google Maps.');
      }
    });
  }, [listing?.location]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.muted}>Loading property…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!listing) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <Text style={styles.titleSm}>Property not found</Text>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.textBtn}>
            <Text style={styles.textBtnLabel}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const allPhotos: string[] =
    listing.photos?.map((p: any) => p.photoUrl || p.photo_url || p).filter(Boolean) ||
    (listing.image ? [listing.image] : []);

  const amenityTokens = parseStoredAmenities(listing.amenities);
  const detailTitle = listing.propertyType ? `${listing.propertyType} Details` : 'Property Details';

  const hasValidated =
    !!(listing.ownership || listing.builtUpArea || listing.propertyUsage || listing.balconySize);

  const sellerAvatar =
    listing.user?.profileImageUrl || 'https://i.pravatar.cc/150?img=12';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroWrap}>
          {allPhotos.length > 0 ? (
            <FlatList
              data={allPhotos}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(uri, i) => `${uri}-${i}`}
              onViewableItemsChanged={onHeroViewable}
              viewabilityConfig={viewConfig}
              renderItem={({ item }) => (
                <Image source={{ uri: item }} style={styles.heroImage} resizeMode="cover" />
              )}
            />
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]}>
              <Text style={styles.muted}>No photo</Text>
            </View>
          )}

          <View style={styles.heroTopBar}>
            <TouchableOpacity style={styles.circleBtnLight} onPress={() => navigation?.goBack()}>
              <BackIcon size={22} color="#111" />
            </TouchableOpacity>
            {/* {allPhotos.length > 0 && (
              <View style={styles.heroTopActions}>
                <TouchableOpacity style={styles.circleBtnPrimary} activeOpacity={0.85}>
                  <SearchIcon size={14} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.circleBtnPrimary} activeOpacity={0.85}>
                  <ShareIcon size={14} color="#FFF" />
                </TouchableOpacity>
              </View>
            )} */}
          </View>

          {allPhotos.length > 1 && (
            <View style={styles.dotsRow}>
              {allPhotos.map((_, i) => (
                <View key={i} style={[styles.dot, i === heroIndex && styles.dotActive]} />
              ))}
            </View>
          )}
        </View>

        <View style={styles.padH}>
          <Text style={styles.listingTitle}>{listing.title || 'Property'}</Text>
          <Text style={styles.views}>{formatViews(listing.viewsCount ?? listing.views)}</Text>
          <Text style={styles.price}>
            {formatListingPrice(listing.price, listing.currency ?? 'AED')}
          </Text>

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{detailTitle}</Text>
            <View style={styles.sectionActions}>
              <TouchableOpacity style={styles.inlineAction} onPress={handleSave} disabled={saving}>
                {saving ? (
                  <ActivityIndicator size="small" color={Colors.light.primary} />
                ) : (
                  <SaveIcon size={14} color={saved ? '#EF4444' : '#1B1B1B'} filled={saved} />
                )}
                <Text style={[styles.inlineActionText, saved && { color: '#EF4444' }]}>Save</Text>
              </TouchableOpacity>
              <Text style={styles.sep}>|</Text>
              <TouchableOpacity style={styles.inlineAction} onPress={() => Alert.alert('Report', 'Thank you for your feedback.')}>
                <ReportIcon size={12} color="#1B1B1B" />
                <Text style={styles.inlineActionText}>Report</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.card}>
            {!!listing.bedrooms && (
              <View style={styles.bulletRow}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>{listing.bedrooms} bedrooms</Text>
              </View>
            )}
            {!!listing.bathrooms && (
              <View style={styles.bulletRow}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>
                  {listing.bathrooms} bathroom{listing.bathrooms === 1 ? '' : 's'}
                </Text>
              </View>
            )}
            {!!listing.squareFeet && (
              <View style={styles.bulletRow}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>{Number(listing.squareFeet).toLocaleString()} sqft</Text>
              </View>
            )}
            {!listing.bedrooms && !listing.bathrooms && !listing.squareFeet && (
              <Text style={styles.muted}>No room measurements provided.</Text>
            )}
          </View>

          <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>Property Information</Text>
          <View style={styles.card}>
            <InfoRow label="Type" value={listing.propertyType} />
            <InfoRow label="Purpose" value={listing.propertyPurpose} />
            <InfoRow label="Reference no." value={listing.referenceNo} />
            <InfoRow label="Furnishing" value={listing.furnishing} />
            <InfoRow label="Added on" value={formatListingDate(listing.createdAt)} />
            {!!listing.city && <InfoRow label="City" value={listing.city} />}
            {!!listing.location && (
              <View style={styles.locRow}>
                <InfoRow label="Location" value={listing.location} />
              </View>
            )}
          </View>

          {hasValidated && (
            <>
              <View style={styles.validatedHeader}>
                <View style={styles.validatedHeaderTitleRow}>
                  <Text style={[styles.sectionTitle, { flex: 0 }]}>Validated Information</Text>
                  <View style={styles.checkBadge}>
                    <Text style={styles.checkMark}>✓</Text>
                  </View>
                </View>
              </View>
              <View style={styles.card}>
                <InfoRow label="Ownership" value={listing.ownership} />
                <InfoRow label="Built-up Area" value={listing.builtUpArea} />
                <InfoRow label="Usage" value={listing.propertyUsage} />
                <InfoRow label="Balcony Size" value={listing.balconySize} />
              </View>
            </>
          )}

          {amenityTokens.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>Amenities</Text>
              <View style={styles.amenityRow}>
                {(showAllAmenities ? amenityTokens : amenityTokens.slice(0, 2)).map((t, i) => (
                  <View
                    key={`${t.kind}-${t.kind === 'known' ? t.id : t.label}-${i}`}
                    style={styles.amenityCard}
                  >
                    <View style={styles.amenityIcon}>
                      <PropertyAmenityIcon
                        amenityId={t.kind === 'known' ? t.id : undefined}
                        size={28}
                        color={Colors.light.primary}
                      />
                    </View>
                    <Text style={styles.amenityLabel} numberOfLines={2}>
                      {t.label}
                    </Text>
                  </View>
                ))}
                {amenityTokens.length > 3 && (
                  <TouchableOpacity
                    style={styles.amenityMore}
                    activeOpacity={0.7}
                    onPress={() => setShowAllAmenities((v) => !v)}
                  >
                    <Text style={styles.amenityMoreText}>
                      {showAllAmenities ? 'Show less' : `+${amenityTokens.length - 3} More`}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}

          {!!listing.additionalTags && (
            <>
              <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>Tags</Text>
              <View style={styles.card}>
                <Text style={styles.tagsBody}>{listing.additionalTags}</Text>
              </View>
            </>
          )}

          {/* {!!listing.description?.trim() && (
            <>
              <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>Description</Text>
              <View style={styles.card}>
                <Text style={styles.descBody}>{listing.description}</Text>
              </View>
            </>
          )} */}

          <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>Map View</Text>
          <View style={styles.mapCard}>
            <Text style={styles.mapAddress} numberOfLines={2}>
              {[listing.location, listing.city].filter(Boolean).join(', ') || 'Address on request'}
            </Text>
            <View style={styles.mapPlaceholder}>
              <ImageBackground
                source={require('../assets/images/world-map.png')}
                style={styles.mapBg}
                imageStyle={styles.mapBgImage}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.showMapBtn}
                activeOpacity={0.85}
                onPress={openInGoogleMaps}
              >
                <LocationIcon size={18} color={Colors.light.primary} />
                <Text style={styles.showMapText}>Show Map</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.postedOn}>Posted On: {formatListingDate(listing.createdAt)}</Text>
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.btnEmail}
          onPress={openMail}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Email seller"
        >
          <View style={styles.btnContentRow}>
            <EmailContactIcon size={17} color="#1D4ED8" />
            <Text style={styles.btnEmailText}>Email</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnCall}
          onPress={openCall}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Call seller"
        >
          <View style={styles.btnContentRow}>
            <CallContactIcon size={17} color="#BE185D" />
            <Text style={styles.btnCallText}>Call</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnWa}
          onPress={openWhatsApp}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="WhatsApp seller"
        >
          <WhatsAppContactIcon size={24} color="#15803D" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  scrollContent: { paddingBottom: Spacing.lg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
  muted: { marginTop: Spacing.sm, color: Colors.light.textSecondary, fontSize: 14 },
  titleSm: { ...Typography.h3, color: Colors.light.text, marginBottom: Spacing.md },
  textBtn: { padding: Spacing.md },
  textBtnLabel: { color: Colors.light.primary, fontSize: 16 },
  heroWrap: { width: SCREEN_W, height: HERO_H, backgroundColor: '#E5E7EB' },
  heroImage: { width: SCREEN_W, height: HERO_H },
  heroPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  heroTopBar: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTopActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  circleBtnLight: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBtnPrimary: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsRow: {
    position: 'absolute',
    bottom: Spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: '#FFF', width: 8, height: 8, borderRadius: 4 },
  padH: { paddingHorizontal: Spacing.md },
  listingTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: Spacing.md,
  },
  views: { fontSize: 14, color: Colors.light.textSecondary, marginTop: 4 },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.primary,
    marginTop: Spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: Spacing.lg,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: Colors.light.text, flex: 1 },
  sectionTitleSpaced: { marginTop: Spacing.lg },
  sectionActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  inlineAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  inlineActionText: { fontSize: 14, color: Colors.light.text },
  sep: { color: Colors.light.textSecondary },
  card: {
    backgroundColor: '#F3F4F6',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  bulletRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.light.text },
  bulletText: { fontSize: 14, color: Colors.light.text },
  kvRow: { flexDirection: 'row', marginBottom: Spacing.sm, flexWrap: 'wrap' },
  kvLabel: { width: 120, fontSize: 14, color: Colors.light.textSecondary },
  kvValue: { flex: 1, fontSize: 14, color: Colors.light.text, fontWeight: '500' },
  locRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginTop: Spacing.xs },
  locText: { flex: 1, fontSize: 14, color: Colors.light.text },
  validatedHeader: { marginTop: Spacing.lg },
  validatedHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  amenityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.sm },
  amenityCard: {
    width: (SCREEN_W - Spacing.md * 2 - Spacing.sm * 2) / 3,
    backgroundColor: '#F3F4F6',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    minHeight: 88,
  },
  amenityIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FFF',
    marginBottom: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amenityLabel: { fontSize: 11, color: Colors.light.text, textAlign: 'center' },
  amenityMore: {
    width: (SCREEN_W - Spacing.md * 2 - Spacing.sm * 2) / 3,
    backgroundColor: '#F3F4F6',
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 88,
  },
  amenityMoreText: { color: Colors.light.primary, fontWeight: '600', fontSize: 14 },
  tagsBody: { fontSize: 14, color: Colors.light.text, lineHeight: 20 },
  descBody: { fontSize: 14, color: Colors.light.textSecondary, lineHeight: 22 },
  mapCard: {
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: Spacing.md,
    backgroundColor: '#FAFAFA',
  },
  mapAddress: { fontSize: 14, color: Colors.light.text, marginBottom: Spacing.md },
  mapPlaceholder: {
    height: 140,
    borderRadius: BorderRadius.md,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mapBg: {
    ...StyleSheet.absoluteFillObject,
  },
  mapBgImage: {
    opacity: 0.9,
    transform: [{ scale: 1.4 }],
  },
  showMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#FFF',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  showMapText: { fontSize: 14, fontWeight: '600', color: Colors.light.primary },
  postedOn: {
    marginTop: Spacing.md,
    fontSize: 13,
    color: Colors.light.textSecondary,
    textAlign: 'left',
  },
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  btnContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  btnEmail: {
    flex: 1,
    backgroundColor: '#DBEAFE',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnEmailText: { fontWeight: '600', color: '#1D4ED8', fontSize: 14 },
  btnCall: {
    flex: 1,
    backgroundColor: '#FCE7F3',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCallText: { fontWeight: '600', color: '#BE185D', fontSize: 14 },
  btnWa: {
    flex: 1,
    backgroundColor: '#DCFCE7',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
