/**
 * Phone Icon Component using SVG
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface PhoneIconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const PhoneIcon: React.FC<PhoneIconProps> = ({
  size = 24,
  color = '#FFFFFF',
  style,
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      <Path
        d="M6.42459 3.23775C7.51203 2.76707 8.77662 3.00825 9.61449 3.84612L9.9591 4.19073C11.0636 5.29519 11.3313 6.98519 10.6223 8.37694L9.97022 9.65693C9.58386 10.4153 9.72975 11.3363 10.3316 11.9381L12.0619 13.6684C12.6637 14.2702 13.5847 14.4161 14.3431 14.0298L15.6231 13.3777C17.0148 12.6687 18.7048 12.9364 19.8093 14.0409L20.1539 14.3855C20.9918 15.2234 21.2329 16.488 20.7623 17.5754C19.4986 20.4948 16.2974 21.9789 13.6038 20.2867C11.9845 19.2694 10.0931 17.8454 8.12386 15.8761C6.15459 13.9069 4.73063 12.0155 3.71332 10.3962C2.02107 7.70255 3.50523 4.50135 6.42459 3.23775Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

