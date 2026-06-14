/**
 * Store hub — View Store Profile action icon
 */

import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import { ViewStyle } from 'react-native';
import { Colors } from '../../config/theme';

interface StoreHubProfileIconProps {
  size?: number;
  style?: ViewStyle;
}

export const StoreHubProfileIcon: React.FC<StoreHubProfileIconProps> = ({
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
      d="M13 19L22 13L31 19V29C31 29.5523 30.5523 30 30 30H14C13.4477 30 13 29.5523 13 29V19Z"
      stroke={Colors.light.primary}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M18 30V22H26V30"
      stroke={Colors.light.primary}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
