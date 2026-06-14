/**
 * Store Dashboard — Add Listing quick action icon
 */

import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface StoreQuickActionAddIconProps {
  size?: number;
  style?: ViewStyle;
}

const CIRCLE_CX = 25.4836;
const CIRCLE_CY = 25.4836;
const CIRCLE_R = 25.4836;

export const StoreQuickActionAddIcon: React.FC<StoreQuickActionAddIconProps> = ({
  size = 51,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 51 51" fill="none" style={style}>
    <Circle cx={CIRCLE_CX} cy={CIRCLE_CY} r={CIRCLE_R} fill="#0D475C" />
    <Path
      d="M18.041 25.4834H32.9065"
      stroke="white"
      strokeWidth={2.12363}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M25.4727 18.0508V32.9162"
      stroke="white"
      strokeWidth={2.12363}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
