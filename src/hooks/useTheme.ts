/**
 * Custom hook for theme management
 */

import { useColorScheme } from 'react-native';
import { Colors } from '../config/theme';

export const useTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return {
    colors: isDark ? Colors.dark : Colors.light,
    isDark,
  };
};



