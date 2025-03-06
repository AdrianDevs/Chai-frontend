import React from 'react';
import type { Theme } from '../providers/theme';

const themes = [
  'light',
  'dark',
  'cupcake',
  'aqua',
  'cyberpunk',
  'nord',
  'dracula',
] as const;

export { themes };

export type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  nextTheme: () => void;
};

export const ThemeContext = React.createContext<ThemeContextType | undefined>(
  undefined
);
