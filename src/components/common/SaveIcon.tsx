/**
 * Save Icon Component using SVG
 * Supports both outline and filled heart states
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface SaveIconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
  filled?: boolean;
}

export const SaveIcon: React.FC<SaveIconProps> = ({
  size = 24,
  color = '#1B1B1B',
  style,
  filled = false,
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      style={style}
    >
      <Path
        d="M8.05556 1.5C9.81667 1.5 11 3.17625 11 4.74C11 7.90688 6.08889 10.5 6 10.5C5.91111 10.5 1 7.90688 1 4.74C1 3.17625 2.18333 1.5 3.94444 1.5C4.95556 1.5 5.61667 2.01188 6 2.46188C6.38333 2.01188 7.04444 1.5 8.05556 1.5Z"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

