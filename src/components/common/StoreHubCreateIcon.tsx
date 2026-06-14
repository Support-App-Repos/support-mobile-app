/**
 * Store hub — Create New Store action icon
 */

import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import { ViewStyle } from 'react-native';
import { Colors } from '../../config/theme';

interface StoreHubCreateIconProps {
  size?: number;
  style?: ViewStyle;
}

export const StoreHubCreateIcon: React.FC<StoreHubCreateIconProps> = ({
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
      d="M14 19L22 13L30 19V29C30 29.5523 29.5523 30 29 30H15C14.4477 30 14 29.5523 14 29V19Z"
      stroke={Colors.light.primary}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 21V27"
      stroke={Colors.light.primary}
      strokeWidth="1.75"
      strokeLinecap="round"
    />
    <Path
      d="M19 24H25"
      stroke={Colors.light.primary}
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </Svg>
);
