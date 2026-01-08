/**
 * Select Event Type Screen
 * Screen for selecting an event type when creating an event listing
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackIcon, BellIcon, ForwardIcon, PartyIcon, MeetingIcon, WorkshopIcon } from '../components/common';
import { BottomNavigation, type BottomNavItem } from '../components/navigation';
import { Colors, Spacing, Typography, BorderRadius } from '../config/theme';
import { categoryService } from '../services';
import { useProfile } from '../hooks';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.md * 3) / 2; // Account for padding and gap

type SelectEventTypeScreenProps = {
  navigation?: any;
  route?: {
    params?: {
      category?: string;
    };
  };
};

export type EventType = 'Parties' | 'Meetings' | 'Workshops';

interface EventTypeOption {
  id: EventType;
  title: string;
  description: string;
  icon: React.ReactNode;
}

// Map event type names to icons
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
        // Filter by categoryId if provided
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

  const handleEventTypeSelect = (eventType: any) => {
    setSelectedEventType(eventType);
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

  const handleBack = () => {
    navigation?.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <BackIcon size={24} color="#030303" />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={() => {
              // TODO: Navigate to notifications
              console.log('Notifications pressed');
            }}
          >
            <BellIcon size={24} color="#111827" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profileButton}
            activeOpacity={0.7}
            onPress={() => {
              // TODO: Navigate to profile
              console.log('Profile pressed');
            }}
          >
            <Image
              source={{ uri: profileImageUrl || 'https://i.pravatar.cc/150?img=12' }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.titleText}>Select Event Type</Text>
      </View>

      {/* Content */}
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
          <View style={styles.eventTypesGrid}>
            {eventTypes.map((eventType) => (
              <TouchableOpacity
                key={eventType.id}
                style={[
                  styles.eventTypeCard,
                  selectedEventType?.id === eventType.id && styles.eventTypeCardSelected,
                ]}
                onPress={() => handleEventTypeSelect(eventType)}
                activeOpacity={0.8}
              >
                <View style={styles.eventTypeIcon}>{getEventTypeIcon(eventType.name)}</View>
                <Text style={styles.eventTypeTitle}>{eventType.name}</Text>
                <Text style={styles.eventTypeDescription}>
                  {eventType.description || 'Select to create listing'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedEventType && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedEventType}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.continueButtonText,
              !selectedEventType && styles.continueButtonTextDisabled,
            ]}
          >
            Continue to details
          </Text>
          <ForwardIcon
            size={20}
            color={selectedEventType ? '#FFFFFF' : '#9CA3AF'}
          />
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabPress={(tab) => {
          setActiveTab(tab);
          if (tab === 'Home') {
            navigation?.navigate('Home');
          } else if (tab === 'MyListings') {
            navigation?.navigate('MyListings');
          } else if (tab === 'Messages') {
            // TODO: Navigate to Messages screen when implemented
            console.log('Messages screen not yet implemented');
          } else if (tab === 'Profile') {
            navigation?.navigate('Profile');
          }
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
    marginLeft: -Spacing.xs,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconButton: {
    padding: Spacing.xs,
  },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  titleSection: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  titleText: {
    ...Typography.h2,
    color: Colors.light.text,
    fontWeight: '700',
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  eventTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  eventTypeCard: {
    width: CARD_WIDTH,
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'flex-start',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    minHeight: 160,
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  eventTypeCardSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: '#F0F9FF',
  },
  eventTypeIcon: {
    marginBottom: Spacing.sm,
  },
  eventTypeTitle: {
    ...Typography.h3,
    color: Colors.light.text,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    fontSize: 16,
    textAlign: 'left',
  },
  eventTypeDescription: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    textAlign: 'left',
    fontSize: 12,
  },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.light.background,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    borderRadius: 9999, // Pill shape
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  continueButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  continueButtonText: {
    ...Typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  continueButtonTextDisabled: {
    color: '#9CA3AF',
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

