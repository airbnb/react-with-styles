import detectHooks from './utils/detectHooks';
import { withStylesWithHooks } from './withStylesWithHooks';
import { withStylesWithThemedStyleSheet } from './withStylesWithThemedStyleSheet';
import ThemedStyleSheet from './ThemedStyleSheet';

export { withStylesPropTypes } from './withStylesPropTypes';

export function withStyles(...args) {
  if (detectHooks()) {
    return withStylesWithHooks(...args);
  }

  return withStylesWithThemedStyleSheet(...args);
}

export default withStyles;

// For backward compatibility
// Highly recommend using the injected prop instead of using this directly
const css = ThemedStyleSheet.resolveLTR;
export { css };
