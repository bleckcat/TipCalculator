/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

// Green Palette
const greenPrimary = "#2E7D32"; // Forest green
const greenSecondary = "#388E3C"; // Medium green
const greenTertiary = "#43A047"; // Lighter green
const greenLight = "#66BB6A"; // Light green
const greenLighter = "#81C784"; // Very light green
const greenLightest = "#E8F5E9"; // Pale green

// Dark Background - Neutral/Titanium gray
const darkBackground = "#1A1A1B"; // Deep charcoal gray
const darkCard = "#242526"; // Slightly lighter gray
const darkCardDark = "#18191A"; // Even darker gray

// Light Background
const lightBackground = "#FAFAFA"; // Off-white

const tintColorLight = greenPrimary;
const tintColorDark = greenSecondary;

export const Colors = {
  light: {
    text: "#1B5E20", // Dark green for text
    background: lightBackground,
    tint: tintColorLight,
    icon: "#2E7D32",
    tabIconDefault: "#81C784",
    tabIconSelected: greenPrimary,
  },
  dark: {
    text: "#E8F5E9",
    background: darkBackground,
    tint: tintColorDark,
    icon: "#81C784",
    tabIconDefault: "#66BB6A",
    tabIconSelected: greenSecondary,
  },
};

// Custom color palette for the app
export const AppColors = {
  // Light theme (default)
  light: {
    background: lightBackground,
    card: "#FFFFFF",
    cardDark: "#F5F5F5",

    primary: greenPrimary,
    primaryDark: "#1B5E20",
    primaryLight: greenSecondary,

    secondary: greenTertiary,
    secondaryLight: greenLight,

    accent: greenLighter,
    accentLight: greenLightest,

    text: "#212121", // Almost black
    textSecondary: "#424242",
    textMuted: "#9E9E9E",

    border: "#E0E0E0",
    borderLight: "#F5F5F5",

    success: "#4CAF50",
    warning: "#FF9800",
    error: "#f44336",
    info: "#2196F3",
  },

  // Dark theme
  dark: {
    background: darkBackground,
    card: darkCard,
    cardDark: darkCardDark,

    primary: greenSecondary,
    primaryDark: "#1B5E20",
    primaryLight: greenTertiary,

    secondary: greenLight,
    secondaryLight: greenLighter,

    accent: greenLighter,
    accentLight: greenLightest,

    text: "#E4E6EB", // Light gray text
    textSecondary: "#B0B3B8", // Medium gray text
    textMuted: "#8A8D91", // Muted gray

    border: "#3A3B3C", // Dark gray border
    borderLight: "#4E4F50", // Lighter border

    success: "#66BB6A",
    warning: "#FFB74D",
    error: "#EF5350",
    info: "#42A5F5",
  },
};

// Helper function to get colors based on theme
export const getThemeColors = (theme: "light" | "dark") => {
  return AppColors[theme];
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
