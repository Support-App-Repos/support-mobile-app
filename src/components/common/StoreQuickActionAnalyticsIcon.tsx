/**
 * Store Dashboard — Analytics quick action icon
 */

import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';
import { Colors } from '../../config/theme';

interface StoreQuickActionAnalyticsIconProps {
  size?: number;
  style?: ViewStyle;
}

const CIRCLE_CX = 25.4836;
const CIRCLE_CY = 25.4836;
const CIRCLE_R = 25.4836;

export const StoreQuickActionAnalyticsIcon: React.FC<StoreQuickActionAnalyticsIconProps> = ({
  size = 51,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 51 51" fill="none" style={style}>
    <Circle cx={CIRCLE_CX} cy={CIRCLE_CY} r={CIRCLE_R} fill={Colors.light.primary} />
    <Path
      d="M15.918 15.9277V32.9168C15.918 33.48 16.1417 34.0202 16.54 34.4184C16.9382 34.8167 17.4784 35.0404 18.0416 35.0404H35.0307"
      stroke="white"
      strokeWidth={2.12363}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M31.8457 30.7924V22.2979"
      stroke="white"
      strokeWidth={2.12363}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M26.5352 30.7926V18.0508"
      stroke="white"
      strokeWidth={2.12363}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M21.2266 30.7929V27.6064"
      stroke="white"
      strokeWidth={2.12363}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
