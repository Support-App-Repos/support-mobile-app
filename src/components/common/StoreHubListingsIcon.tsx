/**
 * Store hub — Manage Listings (Figma: numbered list)
 */

import React from 'react';
import Svg, { G, Path, Rect } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface StoreHubListingsIconProps {
  size?: number;
  style?: ViewStyle;
}

export const StoreHubListingsIcon: React.FC<StoreHubListingsIconProps> = ({
  size = 48,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={style}>
    <Rect width="48" height="48" rx="12" fill="#FCE7F3" />
    <G transform="translate(12 12)" stroke="#EC4899" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M10 12h11" />
      <Path d="M10 18h11" />
      <Path d="M10 6h11" />
      <Path d="M4 6h1v4" />
      <Path d="M4 10h2" />
      <Path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
    </G>
  </Svg>
);
