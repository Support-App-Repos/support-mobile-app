import React from 'react';
import { ViewStyle } from 'react-native';
import {
  Amenity247SecurityIcon,
  AmenityBalconyIcon,
  AmenityBroadbandInternetIcon,
  AmenityBuiltInKitchenIcon,
  AmenityBuiltInWardrobeIcon,
  AmenityCentralAcAndHeatingIcon,
  AmenityConciergeIcon,
  AmenityDoubleGlazedWindowIcon,
  AmenityEPCRatingIcon,
  AmenityIntercomIcon,
  AmenityParkingIcon,
  AmenityPetsAllowedIcon,
  AmenityPrivateGardenIcon,
  AmenityPrivateGymIcon,
  AmenityPrivatePoolIcon,
  AmenityRoadParkingIcon,
  AmenitySharedBathroomIcon,
  AmenitySharedGardenIcon,
  AmenitySharedGymIcon,
  AmenitySharedKitchenIcon,
  AmenitySharedPoolIcon,
  AmenityTransportHubIcon,
} from './amenities';
import { AmenityGlyphPlaceholder } from './AmenityGlyphPlaceholder';

type GlyphProps = { size?: number; color?: string; style?: ViewStyle };

const AMENITY_GLYPHS: Record<string, React.FC<GlyphProps>> = {
  '24_7_security': Amenity247SecurityIcon,
  balcony: AmenityBalconyIcon,
  broadband_internet: AmenityBroadbandInternetIcon,
  built_in_kitchen: AmenityBuiltInKitchenIcon,
  built_in_wardrobe: AmenityBuiltInWardrobeIcon,
  central_ac_and_heating: AmenityCentralAcAndHeatingIcon,
  concierge: AmenityConciergeIcon,
  double_glazed_window: AmenityDoubleGlazedWindowIcon,
  EPC_rating: AmenityEPCRatingIcon,
  intercom: AmenityIntercomIcon,
  parking: AmenityParkingIcon,
  pets_allowed: AmenityPetsAllowedIcon,
  private_garden: AmenityPrivateGardenIcon,
  private_gym: AmenityPrivateGymIcon,
  private_pool: AmenityPrivatePoolIcon,
  road_parking: AmenityRoadParkingIcon,
  shared_bathroom: AmenitySharedBathroomIcon,
  shared_garden: AmenitySharedGardenIcon,
  shared_gym: AmenitySharedGymIcon,
  shared_kitchen: AmenitySharedKitchenIcon,
  shared_pool: AmenitySharedPoolIcon,
  transport_hub: AmenityTransportHubIcon,
};

export interface PropertyAmenityIconProps {
  amenityId?: string | null;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const PropertyAmenityIcon: React.FC<PropertyAmenityIconProps> = ({
  amenityId,
  size = 24,
  color = '#D13A3F',
  style,
}) => {
  const Icon = amenityId ? AMENITY_GLYPHS[amenityId] : undefined;
  if (!Icon) {
    return <AmenityGlyphPlaceholder size={size} color={color} style={style} />;
  }
  return <Icon size={size} color={color} style={style} />;
};
