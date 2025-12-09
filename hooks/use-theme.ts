import { getThemeColors } from '@/constants/theme';
import { useApp } from '@/context/AppContext';

export function useTheme() {
  const { state } = useApp();
  const theme = state?.theme || 'light'; // Fallback to light theme
  const colors = getThemeColors(theme);
  
  return {
    theme,
    colors,
  };
}
