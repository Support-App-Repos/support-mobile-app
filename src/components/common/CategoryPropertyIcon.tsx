/**
 * Properties Icon — home (Select Category / marketing)
 * Tile: 36×36, radius 8, padding 8; glyph in 20×20 viewBox.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface PropertiesIconProps {
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const PropertiesIcon: React.FC<PropertiesIconProps> = ({
  color = '#B74DED',
  backgroundColor = '#F5E6FD',
  style,
}) => (
  <View style={[styles.tile, { backgroundColor }, style]}>
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.41036 2.74399C9.56663 2.58776 9.77856 2.5 9.99953 2.5C10.2205 2.5 10.4324 2.58776 10.5887 2.74399L15.5887 7.74399L17.2554 9.41066C17.4072 9.56782 17.4912 9.77833 17.4893 9.99682C17.4874 10.2153 17.3997 10.4243 17.2452 10.5788C17.0907 10.7333 16.8817 10.821 16.6632 10.8229C16.4447 10.8248 16.2342 10.7408 16.077 10.589L15.8329 10.3448V15.8332C15.8329 16.2752 15.6573 16.6991 15.3447 17.0117C15.0321 17.3242 14.6082 17.4998 14.1662 17.4998H11.6662C11.4452 17.4998 11.2332 17.412 11.0769 17.2557C10.9207 17.0995 10.8329 16.8875 10.8329 16.6665V14.1665H9.16619V16.6665C9.16619 16.8875 9.07839 17.0995 8.92211 17.2557C8.76583 17.412 8.55387 17.4998 8.33286 17.4998H5.83286C5.39083 17.4998 4.96691 17.3242 4.65435 17.0117C4.34179 16.6991 4.16619 16.2752 4.16619 15.8332V10.3448L3.92203 10.589C3.76486 10.7408 3.55436 10.8248 3.33586 10.8229C3.11736 10.821 2.90835 10.7333 2.75384 10.5788C2.59934 10.4243 2.5117 10.2153 2.5098 9.99682C2.5079 9.77833 2.59189 9.56782 2.74369 9.41066L4.41036 7.74399L9.41036 2.74399Z"
        fill={color}
      />
    </Svg>
  </View>
);

const styles = StyleSheet.create({
  tile: {
    width: 36,
    height: 36,
    borderRadius: 8,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 1,
  },
});
