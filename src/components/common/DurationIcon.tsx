/**
 * Duration Icon Component
 */

import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface DurationIconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const DurationIcon: React.FC<DurationIconProps> = ({
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
      <Circle opacity="0.2" cx="10.0003" cy="11.9998" r="8.33333" fill={color} />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 5.6C6.46538 5.6 3.6 8.46538 3.6 12C3.6 15.5346 6.46538 18.4 10 18.4C13.5346 18.4 16.4 15.5346 16.4 12C16.4 8.46538 13.5346 5.6 10 5.6ZM2 12C2 7.58172 5.58172 4 10 4C14.4183 4 18 7.58172 18 12C18 16.4183 14.4183 20 10 20C5.58172 20 2 16.4183 2 12ZM10 7.2C10.4418 7.2 10.8 7.55817 10.8 8V11.2H14C14.4418 11.2 14.8 11.5582 14.8 12C14.8 12.4418 14.4418 12.8 14 12.8H10C9.55817 12.8 9.2 12.4418 9.2 12V8C9.2 7.55817 9.55817 7.2 10 7.2Z"
        fill={color}
      />
    </Svg>
  );
};

