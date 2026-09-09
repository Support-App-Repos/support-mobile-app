/**
 * Select Event Type Screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PartyIcon, MeetingIcon, WorkshopIcon } from '../components/common';
import {
  ListingWizardHeader,
  ListingTypeCard,
  ListingWizardFooter,
} from '../components/listings/wizard';
import { BottomNavigation, type BottomNavItem } from '../components/navigation';
import { Colors, Spacing, Typography } from '../config/theme';
import { categoryService } from '../services';
import { useProfile } from '../hooks';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.md * 2 - Spacing.sm) / 2;

type SelectEventTypeScreenProps = {
  navigation?: any;
  route?: {
    params?: {
      category?: string;
      categoryId?: string;
    };
  };
};

const getEventTypeIcon = (eventTypeName: string) => {
  const name = eventTypeName.toLowerCase();
  if (name.includes('party') || name.includes('parties')) {
    return <PartyIcon size={24} color="#FF146E" />;
  }
  if (name.includes('meeting') || name.includes('meetings')) {
    return <MeetingIcon size={24} />;
  }
  if (name.includes('workshop') || name.includes('workshops')) {
    return <WorkshopIcon size={24} />;
  }
  return <PartyIcon size={24} color="#FF146E" />;
};

const getEventTypeTag = (eventTypeName: string): string | undefined => {
  const name = eventTypeName.toLowerCase();
  if (name.includes('party')) return 'Fun & Social';
  if (name.includes('meeting')) return 'Professional';
  if (name.includes('workshop')) return 'Learning & Growth';
  return undefined;
};

export const SelectEventTypeScreen: React.FC<SelectEventTypeScreenProps> = ({
  navigation,
  route,
}) => {
  const [eventTypes, setEventTypes] = useState<any[]>([]);
  const [selectedEventType, setSelectedEventType] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<BottomNavItem>('Home');
  const [loading, setLoading] = useState(true);
  const { profileImageUrl } = useProfile();
  const categoryId = route?.params?.categoryId;

  useEffect(() => {
    fetchEventTypes();
  }, []);

  const fetchEventTypes = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getEventTypes();
      const eventTypesData = (response.data as any)?.data || response.data || [];

      if (response.success && Array.isArray(eventTypesData)) {
        const filtered = categoryId
          ? eventTypesData.filter((et: any) => et.categoryId === categoryId)
          : eventTypesData;
        setEventTypes(filtered);
      }
    } catch (error: any) {
      console.error('Error fetching event types:', error);
      Alert.alert('Error', error.message || 'Failed to load event types');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (selectedEventType) {
      navigation?.navigate('EventListing', {
        categoryId: categoryId || route?.params?.category,
        category: route?.params?.category || 'Events',
        eventTypeId: selectedEventType.id,
        eventType: selectedEventType.name || selectedEventType.slug,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ListingWizardHeader
        eyebrow="Step 1 of 3"
        title="Select Event Type"
        subtitle="Choose the type that best fits your event."
        profileImageUrl={profileImageUrl}
        onBack={() => navigation?.goBack()}
        onProfilePress={() => navigation?.navigate('Profile')}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.loadingText}>Loading event types...</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {eventTypes.map((eventType) => (
              <ListingTypeCard
                key={eventType.id}
                style={{ width: CARD_WIDTH }}
                title={eventType.name}
                description={eventType.description || 'Select to create listing'}
                icon={getEventTypeIcon(eventType.name)}
                tag={getEventTypeTag(eventType.name)}
                selected={selectedEventType?.id === eventType.id}
                onPress={() => setSelectedEventType(eventType)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <ListingWizardFooter
        label="Continue to details"
        onPress={handleContinue}
        disabled={!selectedEventType}
      />

      <BottomNavigation
        activeTab={activeTab}
        onTabPress={(tab) => {
          setActiveTab(tab);
          if (tab === 'Home') navigation?.navigate('Home');
          else if (tab === 'Store') navigation?.navigate('Store');
          else if (tab === 'Profile') navigation?.navigate('Profile');
        }}
        onCreatePress={() => {}}
        showCreateButton={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    marginTop: Spacing.md,
  },
});
