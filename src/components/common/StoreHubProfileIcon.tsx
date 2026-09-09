/**
 * Store hub — View Store Profile (Figma: eye outline)
 */

import React from 'react';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface StoreHubProfileIconProps {
  size?: number;
  style?: ViewStyle;
}

export const StoreHubProfileIcon: React.FC<StoreHubProfileIconProps> = ({
  size = 48,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={style}>
    <Rect width="48" height="48" rx="12" fill="#E8F8EF" />
    <G transform="translate(12 12)" stroke="#22C55E" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <Circle cx="12" cy="12" r="3" />
    </G>
  </Svg>
);
