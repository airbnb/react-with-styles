import { useRef } from 'react';
import { DIRECTIONS } from 'react-with-direction';

const NOOP = () => {};

// Use a cache to store the created and resolved styles by direction.
// This way, if the theme and the interface don't change, we do not recalculate
// styles or any other interface derivations. They are effectively only calculated
// once per direction, until the theme or interface change.
export default function useThemedStyleSheetCache({ direction, stylesInterface, stylesTheme }) {
  const cacheRefLTR = useRef();
  const cacheRefRTL = useRef();

  const directionSelector = direction === DIRECTIONS.RTL ? 'RTL' : 'LTR';
  const cacheRef = direction === DIRECTIONS.RTL ? cacheRefRTL : cacheRefLTR;

  if (
    cacheRef.current
    && cacheRef.current.stylesInterface === stylesInterface
    && cacheRef.current.stylesTheme === stylesTheme
  ) {
    return cacheRef.current;
  }

  cacheRef.current = {
    stylesInterface,
    stylesTheme,
    create: stylesInterface[`create${directionSelector}`] || stylesInterface.create,
    resolve: stylesInterface[`resolve${directionSelector}`] || stylesInterface.resolve,
    flush: stylesInterface.flush || NOOP,
    createdStyles: null,
    resolvedProps: null,
  };

  return cacheRef.current;
}
