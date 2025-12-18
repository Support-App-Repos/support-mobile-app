/**
 * Password Changed Icon Component using SVG
 */

import React from 'react';
import Svg, { Path, G } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface PasswordChangedIconProps {
  size?: number;
  style?: ViewStyle;
}

export const PasswordChangedIcon: React.FC<PasswordChangedIconProps> = ({
  size = 84,
  style,
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 84 84"
      fill="none"
      style={style}
    >
      <G opacity="0.758057">
        <Path
          d="M41.8291 1.8291C63.9051 1.8291 81.8291 19.7531 81.8291 41.8291C81.8291 63.9051 63.9051 81.8291 41.8291 81.8291C19.7531 81.8291 1.8291 63.9051 1.8291 41.8291C1.8291 19.7531 19.7531 1.8291 41.8291 1.8291Z"
          fill="#C1EBD0"
        />
        <Path
          d="M41.8291 1.8291C63.9051 1.8291 81.8291 19.7531 81.8291 41.8291C81.8291 63.9051 63.9051 81.8291 41.8291 81.8291C19.7531 81.8291 1.8291 63.9051 1.8291 41.8291C1.8291 19.7531 19.7531 1.8291 41.8291 1.8291Z"
          stroke="white"
          strokeWidth="3.6582"
        />
      </G>
      <Path
        d="M41.8289 9.20898C59.9328 9.20898 74.6318 23.908 74.6318 42.012C74.6318 60.1159 59.9328 74.8149 41.8289 74.8149C23.7249 74.8149 9.02588 60.1159 9.02588 42.012C9.02588 23.908 23.7249 9.20898 41.8289 9.20898Z"
        fill="#49B66F"
      />
      <Path
        d="M26.5396 43.3354L36.0839 52.6944L55.358 32.7717"
        stroke="white"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};




