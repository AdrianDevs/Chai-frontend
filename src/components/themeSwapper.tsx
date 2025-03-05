import { useTheme } from '../hooks/useTheme';

const ThemeSwapper = () => {
  const { theme, nextTheme } = useTheme();

  return (
    <button className="btn btn-circle btn-secondary" onClick={nextTheme}>
      {theme.charAt(0).toUpperCase()}
      {theme.charAt(1)}
    </button>
  );
};

export default ThemeSwapper;
