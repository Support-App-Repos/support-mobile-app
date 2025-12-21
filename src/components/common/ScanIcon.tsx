/**
 * Scan Icon Component
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface ScanIconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const ScanIcon: React.FC<ScanIconProps> = ({
  size = 20,
  color = '#797979',
  style,
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      style={style}
    >
      <Path
        d="M15 4.375H5V8.125H3.75V4.375C3.75 3.68462 4.30969 3.125 5 3.125H15C15.6903 3.125 16.25 3.68462 16.25 4.375V8.125H15V4.375Z"
        fill={color}
        fillOpacity="0.6"
      />
      <Path
        d="M3.75 11.875H5V15.625H15V11.875H16.25V15.625C16.25 16.3154 15.6903 16.875 15 16.875H5C4.30969 16.875 3.75 16.3154 3.75 15.625V11.875Z"
        fill={color}
        fillOpacity="0.6"
      />
      <Path
        d="M17.5 9.375V10.625H2.5V9.375H17.5Z"
        fill={color}
        fillOpacity="0.6"
      />
    </Svg>
  );
};



