/**
 * Calendar Icon Component
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
  size = 20,
  color = '#00CAD4',
  style,
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 20 24"
      fill="none"
      style={style}
    >
      <Path
        d="M7 7.26316H6.66667C5.19391 7.26316 4 8.39423 4 9.78947M7 7.26316V6M7 7.26316H13M13 7.26316H13.3333C14.8061 7.26316 16 8.39423 16 9.78947M13 7.26316V6M4 9.78947V15.4737C4 16.8689 5.19391 18 6.66667 18H13.3333C14.8061 18 16 16.8689 16 15.4737V9.78947M4 9.78947H16M6.66667 12.3158H9.33333V14.8421H6.66667V12.3158Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

