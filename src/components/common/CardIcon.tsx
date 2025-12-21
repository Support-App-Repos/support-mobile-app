/**
 * Card Icon Component
 */

import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface CardIconProps {
  size?: number;
  style?: ViewStyle;
}

export const CardIcon: React.FC<CardIconProps> = ({
  size = 22,
  style,
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 22 24"
      fill="none"
      style={style}
    >
      <Rect width="22" height="24" rx="5" fill="#E6EFFF" />
      <Path
        d="M1.83301 10.5L1.83301 17C1.83301 18.1046 2.65382 19 3.66634 19L18.333 19C19.3455 19 20.1663 18.1046 20.1663 17V10.5M1.83301 10.5L1.83301 7C1.83301 5.89543 2.65382 5 3.66634 5L18.333 5C19.3455 5 20.1663 5.89543 20.1663 7L20.1663 10.5M1.83301 10.5H20.1663"
        stroke="#2561D8"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};


