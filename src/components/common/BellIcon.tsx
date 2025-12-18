/**
 * Bell Icon Component
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface BellIconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const BellIcon: React.FC<BellIconProps> = ({
  size = 24,
  color = '#111827',
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
        d="M19.3636 4.63611C19.7386 5.01117 19.9492 5.51978 19.9492 6.05011C19.9492 6.58044 19.7386 7.08906 19.3636 7.46411C19.7919 8.66024 19.8866 9.95039 19.6375 11.1962C19.3884 12.4421 18.8049 13.5966 17.9496 14.5361L15.8276 16.6561C15.4412 17.149 15.1759 17.7258 15.0531 18.3399C14.9303 18.9541 14.9534 19.5885 15.1206 20.1921L3.80762 8.88011C4.41106 9.04716 5.0453 9.07022 5.65928 8.94742C6.27326 8.82463 6.84984 8.55941 7.34262 8.17311L9.46362 6.05011C10.4031 5.19483 11.5577 4.61136 12.8035 4.36226C14.0493 4.11316 15.3395 4.20783 16.5356 4.63611C16.9107 4.26117 17.4193 4.05054 17.9496 4.05054C18.4799 4.05054 18.9886 4.26117 19.3636 4.63611Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7.34259 12.4141L6.63559 13.1211C6.07293 13.6837 5.75684 14.4468 5.75684 15.2426C5.75684 16.0383 6.07293 16.8014 6.63559 17.3641C7.19825 17.9267 7.96137 18.2428 8.75709 18.2428C9.55281 18.2428 10.3159 17.9267 10.8786 17.3641L11.5856 16.6571"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

