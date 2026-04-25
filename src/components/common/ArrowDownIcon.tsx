/**
 * Chevron / caret down (from arrow_down.svg)
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface ArrowDownIconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const ArrowDownIcon: React.FC<ArrowDownIconProps> = ({
  size = 16,
  color = '#111827',
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M16 10L12 14L8 10"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
