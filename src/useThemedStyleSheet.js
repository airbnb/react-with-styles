import { useCallback } from 'react';
import { perfStart, perfEnd } from './perf';
import useThemedStyleSheetCache from './useThemedStyleSheetCache';

const CREATE_START_MARK = 'react-with-styles.create.start';
const CREATE_END_MARK = 'react-with-styles.create.end';
const CREATE_MEASURE_NAME = '\ud83d\udc69\u200d\ud83c\udfa8 [create]';

const RESOLVE_START_MARK = 'react-with-styles.resolve.start';
const RESOLVE_END_MARK = 'react-with-styles.resolve.end';
const RESOLVE_MEASURE_NAME = '\ud83d\udc69\u200d\ud83c\udfa8 [resolve]';

export default function useThemedStyleSheet({
  direction,
  stylesInterface,
  stylesTheme,
}) {
  const stylesCache = useThemedStyleSheetCache({ direction, stylesInterface, stylesTheme });

  const create = useCallback(
    (stylesFn) => {
      // Start performance measurement
      if (process.env.NODE_ENV !== 'production') {
        perfStart(CREATE_START_MARK);
      }
      // Create and cache the styles definition from the stylesFn
      if (!stylesCache.createdStyles) {
        stylesCache.createdStyles = stylesCache.create(stylesFn(stylesTheme));
      }
      // End and log performance measurement
      if (process.env.NODE_ENV !== 'production') {
        perfEnd(CREATE_START_MARK, CREATE_END_MARK, CREATE_MEASURE_NAME);
      }
      // Retrieve the created styles definition form the cache
      return stylesCache.createdStyles;
    },
    [stylesCache],
  );

  const resolve = useCallback(
    (...styles) => {
      // Start performance measurement
      if (process.env.NODE_ENV !== 'production') {
        perfStart(RESOLVE_START_MARK);
      }
      // Resolve and cache the style props
      if (!stylesCache.resolvedStyles) {
        stylesCache.resolvedStyles = stylesCache.resolve(styles);
      }
      // End and log performance measurement
      if (process.env.NODE_ENV !== 'production') {
        perfEnd(RESOLVE_START_MARK, RESOLVE_END_MARK, RESOLVE_MEASURE_NAME);
      }
      // Retrieve the styles props from the cache
      return stylesCache.resolvedStyles;
    },
    [stylesCache],
  );

  const { flush } = stylesCache;

  return {
    create,
    resolve,
    flush,
  };
}
