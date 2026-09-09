/**
 * Calendar Icon — 15×15 outline from Figma booking calendar header
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface CalendarIconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const CalendarIcon: React.FC<CalendarIconProps> = ({
  size = 15,
  color = '#1B4F72',
  style,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 15 15" fill="none" style={style}>
      <Path
        d="M4.99756 1.24951V3.74831"
        stroke={color}
        strokeWidth={1.2494}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.99512 1.24951V3.74831"
        stroke={color}
        strokeWidth={1.2494}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11.8692 2.49902H3.12342C2.4334 2.49902 1.87402 3.0584 1.87402 3.74842V12.4942C1.87402 13.1842 2.4334 13.7436 3.12342 13.7436H11.8692C12.5592 13.7436 13.1186 13.1842 13.1186 12.4942V3.74842C13.1186 3.0584 12.5592 2.49902 11.8692 2.49902Z"
        stroke={color}
        strokeWidth={1.2494}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M1.87402 6.24707H13.1186"
        stroke={color}
        strokeWidth={1.2494}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
