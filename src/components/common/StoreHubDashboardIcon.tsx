/**
 * Store hub — Store Dashboard (Figma: 2×2 grid)
 */

import React from 'react';
import Svg, { G, Rect } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface StoreHubDashboardIconProps {
  size?: number;
  style?: ViewStyle;
}

export const StoreHubDashboardIcon: React.FC<StoreHubDashboardIconProps> = ({
  size = 48,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={style}>
    <Rect width="48" height="48" rx="12" fill="#F3E8FF" />
    <G transform="translate(12 12)" stroke="#A855F7" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <Rect x="3" y="3" width="7" height="7" rx="1.2" />
      <Rect x="14" y="3" width="7" height="7" rx="1.2" />
      <Rect x="3" y="14" width="7" height="7" rx="1.2" />
      <Rect x="14" y="14" width="7" height="7" rx="1.2" />
    </G>
  </Svg>
);
