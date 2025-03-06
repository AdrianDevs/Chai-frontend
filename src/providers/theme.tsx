import { useEffect, useState } from 'react';
import { ThemeContext, themes } from '../types/theme';
import type { ReactNode } from 'react';

export type Theme = (typeof themes)[number];

const STORAGE_KEY = 'chai.ui.theme';

function getStoredTheme(): Theme {
  const theme = localStorage.getItem(STORAGE_KEY);
  return theme ? (JSON.parse(theme) as Theme) : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const nextTheme = () => {
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, nextTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
