/**
 * Filter / sliders control icon for marketplace search row
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface FilterSlidersIconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const FilterSlidersIcon: React.FC<FilterSlidersIconProps> = ({
  size = 20,
  color = '#FFFFFF',
  style,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M4 7h4M15 7h5M4 12h10M4 17h7M14 17h5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M11 5v4M18 10v4M9 15v4"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
};
