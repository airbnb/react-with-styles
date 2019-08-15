import { useContext } from 'react';

import WithStylesContext from './WithStylesContext';
import { _getTheme } from './ThemedStyleSheet';

export default function useStylesTheme() {
  const { stylesTheme } = useContext(WithStylesContext);

  if (stylesTheme) {
    return stylesTheme;
  }

  // Fallback to singleton implementation
  return _getTheme();
}
