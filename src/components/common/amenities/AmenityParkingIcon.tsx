import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

export interface AmenityParkingIconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const AmenityParkingIcon: React.FC<AmenityParkingIconProps> = ({
  size = 24,
  color = '#D13A3F',
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 17 24" fill="none" style={style}>
    <Path d="M13.2636 19.1454L15.75 22.875H0.75L3.23686 19.1447M8.25 19.125L2.65814 13.2482C1.47145 11.9215 0.75 10.17 0.75 8.25C0.75 4.10784 4.10784 0.75 8.25 0.75C12.3922 0.75 15.75 4.10784 15.75 8.25C15.75 10.17 15.0285 11.9215 13.8419 13.2482L8.25 19.125Z" stroke={color} strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M6.84375 8.71875H8.71875C9.75427 8.71875 10.5938 7.87927 10.5938 6.84375C10.5938 5.80823 9.75427 4.96875 8.71875 4.96875H6.84375V8.71875ZM6.84375 8.71875V12.4688" stroke={color} strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);
