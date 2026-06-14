/**
 * Store hub — Store Dashboard action icon
 */

import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import { ViewStyle } from 'react-native';
import { Colors } from '../../config/theme';

interface StoreHubDashboardIconProps {
  size?: number;
  style?: ViewStyle;
}

export const StoreHubDashboardIcon: React.FC<StoreHubDashboardIconProps> = ({
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
      d="M14 14H20V20H14V14Z"
      stroke={Colors.light.primary}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M24 14H30V20H24V14Z"
      stroke={Colors.light.primary}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14 24H20V30H14V24Z"
      stroke={Colors.light.primary}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M24 24H30V30H24V24Z"
      stroke={Colors.light.primary}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
