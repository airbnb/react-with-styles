import { useContext, useState } from 'react';
import { DIRECTIONS } from 'react-with-direction';

import StylesThemeContext from './StylesThemeContext';
import { _getTheme } from '../ThemedStyleSheet';

export default function useStylesTheme({ direction }) {
  const stylesTheme = useContext(StylesThemeContext);
  const [fallbackThemeLTR, setFallbackThemeLTR] = useState();
  const [fallbackThemeRTL, setFallbackThemeRTL] = useState();

  if (stylesTheme) {
    return stylesTheme;
  }

  // Fallback
  const registeredTheme = _getTheme();
  if (direction === DIRECTIONS.LTR && !fallbackThemeLTR) {
    setFallbackThemeLTR(registeredTheme);
    return registeredTheme;
  } if (direction === DIRECTIONS.RTL && !fallbackThemeRTL) {
    setFallbackThemeRTL(registeredTheme);
    return registeredTheme;
  }
  return direction === DIRECTIONS.LTR ? fallbackThemeLTR : fallbackThemeRTL;
}
