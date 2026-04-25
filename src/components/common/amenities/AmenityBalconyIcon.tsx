import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

export interface AmenityBalconyIconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const AmenityBalconyIcon: React.FC<AmenityBalconyIconProps> = ({
  size = 24,
  color = '#D13A3F',
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 22 20" fill="none" style={style}>
    <Path d="M2.75 10.75V18.75M6.75 10.75V18.75M14.75 10.75V18.75M10.75 10.75V18.75M18.75 10.75V18.75M0.75 18.75H20.75M0.75 10.75H20.75M16.75 7.75V1.35C16.75 1.19087 16.6868 1.03826 16.5743 0.925736C16.4617 0.813214 16.3091 0.75 16.15 0.75H5.35C5.19087 0.75 5.03826 0.813214 4.92574 0.925736C4.81321 1.03826 4.75 1.19087 4.75 1.35V7.75" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);
