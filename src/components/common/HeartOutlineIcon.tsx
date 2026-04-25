/**
 * Heart outline for listing card favorite affordance
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface HeartOutlineIconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const HeartOutlineIcon: React.FC<HeartOutlineIconProps> = ({
  size = 18,
  color = '#6B7280',
  style,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M12.1 18.55l-1.05-.96C6.45 13.64 3 10.49 3 7.5 3 5.5 4.5 4 6.5 4c1.2 0 2.35.55 3.1 1.45C10.35 4.55 11.5 4 12.7 4c2 0 3.5 1.5 3.5 3.5 0 2.99-3.45 6.14-8.05 10.09l-1.05.96z"
        stroke={color}
        strokeWidth={1.5}
        fill="none"
      />
    </Svg>
  );
};
