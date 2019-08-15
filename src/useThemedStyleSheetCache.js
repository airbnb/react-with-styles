import { useRef } from 'react';
import { DIRECTIONS } from 'react-with-direction';

const NOOP = () => {};

// Use a cache to store the interface methods and created styles by direction.
// This way, if the theme and the interface don't change, we do not recalculate
// styles or any other interface derivations. They are effectively only calculated
// once per direction, until the theme or interface change.
export default function useThemedStyleSheetCache({ direction, stylesInterface, stylesTheme }) {
  const cacheRefLTR = useRef();
  const cacheRefRTL = useRef();

  // Retrieve the cached interface methods and created styles for this direction
  const cacheRef = direction === DIRECTIONS.RTL ? cacheRefRTL : cacheRefLTR;

  // If the interface and theme haven't changed for this direction,
  // we return all the cached values immediately.
  if (
    cacheRef.current
    && stylesInterface
    && cacheRef.current.stylesInterface === stylesInterface
    && cacheRef.current.stylesTheme === stylesTheme
  ) {
    return cacheRef.current;
  }

  // (Re)Create the cache for this direction if the theme or interface changed
  const directionSelector = direction === DIRECTIONS.RTL ? 'RTL' : 'LTR';
  cacheRef.current = {
    // Store the provided styles interface so that we can determine whether or not
    // the interface methods we have cached are still valid
    stylesInterface,
    // Store the provided styles theme so that we can determine whether or not the
    // interface methods and created styles we have cached are still valid
    stylesTheme,
    // Cache directional interface methods so we don't have to perform the access
    // logic every time the direction changes. This shouldn't happen often, but it
    // also simplifies the code.
    create: stylesInterface[`create${directionSelector}`] || stylesInterface.create,
    resolve: stylesInterface[`resolve${directionSelector}`] || stylesInterface.resolve,
    flush: stylesInterface.flush || NOOP,
    // Used to cache the styles object created for this direction, interface, and theme
    // combination used to create them.
    createdStyles: null,
  };

  return cacheRef.current;
}
