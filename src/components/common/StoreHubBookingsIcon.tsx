/**
 * Store hub — View Bookings (calendar on soft blue tile)
 */

import React from 'react';
import Svg, { G, Path, Rect } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface StoreHubBookingsIconProps {
  size?: number;
  style?: ViewStyle;
}

export const StoreHubBookingsIcon: React.FC<StoreHubBookingsIconProps> = ({
  size = 48,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={style}>
    <Rect width="48" height="48" rx="12" fill="#E0F2FE" />
    <G
      transform="translate(12 12)"
      stroke="#0284C7"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M8 2v4" />
      <Path d="M16 2v4" />
      <Path d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" />
      <Path d="M3 10h18" />
    </G>
  </Svg>
);
