import detectHooks from './utils/detectHooks';
import { withStylesWithHooks } from './withStylesWithHooks';
import { withStylesWithThemedStyleSheet } from './withStylesWithThemedStyleSheet';

export { withStylesPropTypes } from './withStylesPropTypes';

export function withStyles(...args) {
  if (detectHooks()) {
    return withStylesWithHooks(...args);
  }

  return withStylesWithThemedStyleSheet(...args);
}

export default withStyles;
