import { useContext, useState } from 'react';

import StylesInterfaceContext from './StylesInterfaceContext';
import { _getInterface } from '../ThemedStyleSheet';

export default function useStylesInterface() {
  const stylesInterface = useContext(StylesInterfaceContext);
  const [fallbackInterface, setFallbackInterface] = useState();

  if (stylesInterface) {
    return stylesInterface;
  }

  // Fallback
  const registeredInterface = _getInterface();
  if (!fallbackInterface) {
    setFallbackInterface(registeredInterface);
    return registeredInterface;
  }
  return fallbackInterface;
}
