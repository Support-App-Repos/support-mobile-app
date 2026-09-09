/**
 * Store Dashboard — Messages stat icon (phone handset, per design)
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface StoreDashboardMessagesIconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const StoreDashboardMessagesIcon: React.FC<StoreDashboardMessagesIconProps> = ({
  size = 20,
  color = '#A855F7',
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M6.425 3.238C7.512 2.767 8.777 3.008 9.615 3.846L9.959 4.191C11.064 5.295 11.331 6.985 10.622 8.377L9.97 9.657C9.584 10.415 9.73 11.336 10.332 11.938L12.062 13.668C12.664 14.27 13.585 14.416 14.343 14.03L15.623 13.378C17.015 12.669 18.705 12.936 19.809 14.041L20.154 14.386C20.992 15.223 21.233 16.488 20.762 17.575C19.499 20.495 16.297 21.979 13.604 20.287C11.985 19.269 10.093 17.845 8.124 15.876C6.155 13.907 4.731 12.016 3.713 10.396C2.021 7.703 3.505 4.501 6.425 3.238Z"
      stroke={color}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
