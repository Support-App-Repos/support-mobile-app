/**
 * Add New Icon Component (Plus icon for Create Listing)
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface AddNewIconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const AddNewIcon: React.FC<AddNewIconProps> = ({
  size = 24,
  color = 'white',
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
        d="M3 7C3 4.79086 4.79086 3 7 3H17C19.2091 3 21 4.79086 21 7V17C21 19.2091 19.2091 21 17 21H7C4.79086 21 3 19.2091 3 17V7Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7.75781 12H12.0005M12.0005 12H16.2431M12.0005 12V16.2427M12.0005 12V7.75739"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

