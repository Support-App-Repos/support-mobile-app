/**
 * Simple Search Icon Component
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface SimpleSearchIconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const SimpleSearchIcon: React.FC<SimpleSearchIconProps> = ({
  size = 18,
  color = '#667085',
  style,
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 18 17"
      fill="none"
      style={style}
    >
      <Path
        d="M15.75 14.875L13.1251 12.3958M15 8.14583C15 11.471 12.1458 14.1667 8.625 14.1667C5.10418 14.1667 2.25 11.471 2.25 8.14583C2.25 4.82062 5.10418 2.125 8.625 2.125C12.1458 2.125 15 4.82062 15 8.14583Z"
        stroke={color}
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};


