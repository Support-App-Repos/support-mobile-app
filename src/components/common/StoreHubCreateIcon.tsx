/**
 * Store hub — Create New Store (Figma: storefront outline)
 */

import React from 'react';
import Svg, { G, Path, Rect } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface StoreHubCreateIconProps {
  size?: number;
  style?: ViewStyle;
}

export const StoreHubCreateIcon: React.FC<StoreHubCreateIconProps> = ({
  size = 48,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={style}>
    <Rect width="48" height="48" rx="12" fill="#E8EEF2" />
    <G transform="translate(12 12)" stroke="#0D475C" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
      <Path d="M3 9l2.5-5h13L21 9" />
      <Path d="M10 21V13h4v8" />
    </G>
  </Svg>
);
