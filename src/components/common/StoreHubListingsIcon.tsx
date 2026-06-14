/**
 * Store hub — Manage Listings action icon
 */

import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import { ViewStyle } from 'react-native';
import { Colors } from '../../config/theme';

interface StoreHubListingsIconProps {
  size?: number;
  style?: ViewStyle;
}

export const StoreHubListingsIcon: React.FC<StoreHubListingsIconProps> = ({
  size = 44,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 44 44" fill="none" style={style}>
    <Rect
      x="0.5"
      y="0.5"
      width="43"
      height="43"
      rx="10"
      fill={Colors.light.surface}
      stroke={Colors.light.border}
      strokeWidth="1"
    />
    <Path
      d="M16 13H28V31H16V13Z"
      stroke={Colors.light.primary}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M19 13V11C19 10.4477 19.4477 10 20 10H24C24.5523 10 25 10.4477 25 11V13"
      stroke={Colors.light.primary}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M19 18H25"
      stroke={Colors.light.primary}
      strokeWidth="1.75"
      strokeLinecap="round"
    />
    <Path
      d="M19 22H25"
      stroke={Colors.light.primary}
      strokeWidth="1.75"
      strokeLinecap="round"
    />
    <Path
      d="M19 26H23"
      stroke={Colors.light.primary}
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </Svg>
);
