import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

export interface AmenityDoubleGlazedWindowIconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const AmenityDoubleGlazedWindowIcon: React.FC<AmenityDoubleGlazedWindowIconProps> = ({
  size = 24,
  color = '#D13A3F',
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path d="M20.625 10.125H14.625M17.25 1.5V18M3.375 10.125H9.375M6.75 1.5V18M0.375 20.625H23.625V23.625H0.375V20.625ZM14.625 16.875L20.625 19.125V0.375L14.625 2.625V16.875ZM9.375 16.875L3.375 19.125V0.375L9.375 2.625V16.875Z" stroke={color} strokeWidth="1.3" strokeLinejoin="round"/>
    <Path d="M3 0.375H21V19.125H3V0.375Z" stroke={color} strokeWidth="1.3" strokeLinejoin="round"/>
  </Svg>
);
