import { useCallback, useMemo } from 'react';
import { DIRECTIONS } from 'react-with-direction';
import { perfStart, perfEnd } from './perf';

const NOOP = () => {};

const CREATE_START_MARK = 'react-with-styles.create.start';
const CREATE_END_MARK = 'react-with-styles.create.end';
const CREATE_MEASURE_NAME = '\ud83d\udc69\u200d\ud83c\udfa8 [create]';

const RESOLVE_START_MARK = 'react-with-styles.resolve.start';
const RESOLVE_END_MARK = 'react-with-styles.resolve.end';
const RESOLVE_MEASURE_NAME = '\ud83d\udc69\u200d\ud83c\udfa8 [resolve]';

export default function useThemedStyleSheet({
  direction,
  stylesInterface,
  theme,
}) {
  const create = useCallback(
    (stylesFn) => {
      // Start performance measurement
      if (process.env.NODE_ENV !== 'production') {
        perfStart(CREATE_START_MARK);
      }

      // Create styles
      const directionalCreate = (direction === DIRECTIONS.LTR && stylesInterface.createLTR)
        || (direction === DIRECTIONS.RTL && stylesInterface.createRTL)
        || stylesInterface.create;
      const createdStyles = directionalCreate(stylesFn(theme));

      // End and log performance measurement
      if (process.env.NODE_ENV !== 'production') {
        perfEnd(CREATE_START_MARK, CREATE_END_MARK, CREATE_MEASURE_NAME);
      }

      return createdStyles;
    },
    [direction, stylesInterface, theme],
  );

  const resolve = useCallback(
    (...styles) => {
      // Start performance measurement
      if (process.env.NODE_ENV !== 'production') {
        perfStart(RESOLVE_START_MARK);
      }

      // Resolve styles props
      const directionalResolve = (direction === DIRECTIONS.LTR && stylesInterface.resolveLTR)
        || (direction === DIRECTIONS.RTL && stylesInterface.resolveRTL)
        || stylesInterface.resolve;
      const resolvedStyles = directionalResolve(styles);

      // End and log performance measurement
      if (process.env.NODE_ENV !== 'production') {
        perfEnd(RESOLVE_START_MARK, RESOLVE_END_MARK, RESOLVE_MEASURE_NAME);
      }

      return resolvedStyles;
    },
    [direction, stylesInterface],
  );

  const flush = useCallback(stylesInterface.flush || NOOP, [stylesInterface]);

  return useMemo(
    () => ({
      create,
      resolve,
      flush,
    }),
    [create, resolve, flush],
  );
}
