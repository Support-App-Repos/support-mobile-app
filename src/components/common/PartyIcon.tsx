/**
 * Party Icon Component
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface PartyIconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const PartyIcon: React.FC<PartyIconProps> = ({
  size = 24,
  color = '#FF146E',
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
        d="M5.65782 11.002L4.18782 14.31C2.33182 18.484 1.40482 20.571 2.41782 21.584C3.43082 22.597 5.51582 21.669 9.68982 19.814L12.9998 18.342C15.5168 17.223 16.7758 16.664 16.9758 15.585C17.1758 14.506 16.2018 13.532 14.2538 11.585L12.4158 9.746C10.4688 7.798 9.49482 6.824 8.41582 7.025C7.33682 7.225 6.77782 8.484 5.65882 11.001M6.49982 10.5L13.4998 17.5M4.49982 15.5L8.49982 19.5M15.9998 8L18.9998 5M14.1968 2C14.5968 2.667 14.9158 4.4 12.9998 6M21.9998 9.803C21.3328 9.403 19.5998 9.084 17.9998 11M17.9998 2V2.02M21.9998 6V6.02M20.9998 13V13.02M10.9998 3V3.02"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

