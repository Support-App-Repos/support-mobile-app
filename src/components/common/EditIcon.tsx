/**
 * Edit Icon Component
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface EditIconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const EditIcon: React.FC<EditIconProps> = ({
  size = 11,
  color = '#8E8E8E',
  style,
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 11 11"
      fill="none"
      style={style}
    >
      <Path
        d="M10.4056 6.64783V8.29876C10.4056 9.51447 9.42005 10.5 8.20434 10.5H2.70124C1.48553 10.5 0.5 9.51447 0.5 8.29876V2.79566C0.5 1.57995 1.48553 0.594419 2.70124 0.594419H4.35217M3.25155 7.74845V4.9969L7.42609 0.822364C7.85591 0.392545 8.55278 0.392546 8.9826 0.822365L10.1776 2.0174C10.6075 2.44722 10.6075 3.1441 10.1776 3.57392L6.0031 7.74845H3.25155Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};


