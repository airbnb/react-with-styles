import { useContext } from 'react';

import WithStylesContext from '../WithStylesContext';
import { _getInterface } from '../ThemedStyleSheet';

export default function useStylesInterface() {
  const { stylesInterface } = useContext(WithStylesContext);

  if (stylesInterface) {
    return stylesInterface;
  }

  // Fallback to singleton implementation
  return _getInterface();
}
