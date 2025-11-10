/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Orange Palette
const orangePrimary = '#FF7B00';
const orangeSecondary = '#FF8D21';
const orangeTertiary = '#FFA652';
const orangeLight = '#FFB76B';
const orangeLighter = '#FFCD90';
const orangeLightest = '#FFF4DF';

// Dark Background
const darkBackground = '#131312';

const tintColorLight = orangePrimary;
const tintColorDark = orangePrimary;

export const Colors = {
  light: {
    text: '#FFF4DF',
    background: darkBackground,
    tint: tintColorLight,
    icon: '#FFB76B',
    tabIconDefault: '#FFA652',
    tabIconSelected: orangePrimary,
  },
  dark: {
    text: '#FFF4DF',
    background: darkBackground,
    tint: tintColorDark,
    icon: '#FFB76B',
    tabIconDefault: '#FFA652',
    tabIconSelected: orangePrimary,
  },
};

// Custom color palette for the app
export const AppColors = {
  background: darkBackground,
  card: '#1F1F1E',      // Slightly darker than background for better contrast
  cardDark: '#0F0F0E',  // Even darker for nav bar
  
  primary: orangePrimary,
  primaryDark: '#E66F00',
  primaryLight: orangeSecondary,
  
  secondary: orangeTertiary,
  secondaryLight: orangeLight,
  
  accent: orangeLighter,
  accentLight: orangeLightest,
  
  text: '#FFF4DF',
  textSecondary: '#FFCD90',
  textMuted: '#8A8A88',  // Much more muted for inactive icons
  
  border: '#2A2A28',
  borderLight: '#3A3A38',
  
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#f44336',
  info: '#2196F3',
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
