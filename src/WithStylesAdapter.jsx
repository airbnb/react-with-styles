import PropTypes from 'prop-types';
import { CHANNEL as DIRECTION_BROADCAST_KEY, DIRECTIONS } from 'react-with-direction/dist/constants';
import directionBroadcastShape from 'react-with-direction/dist/proptypes/brcast';

import useStyles from './useStyles';
import useBroadcast from './utils/useBroadcast';
import detectHooks from './utils/detectHooks';
import EMPTY_STYLES_FN from './utils/emptyStylesFn';

export { withStylesPropTypes } from './withStylesPropTypes';

const contextTypes = {
  [DIRECTION_BROADCAST_KEY]: directionBroadcastShape,
};

const propTypes = {
  children: PropTypes.func,
  flushBefore: PropTypes.bool,
  stylesFn: PropTypes.func,
};

const defaultProps = {
  children: () => null,
  stylesFn: EMPTY_STYLES_FN,
  flushBefore: false,
};

// The wrapper component that injects the withStyles props
function WithStylesAdapter({ children, flushBefore, stylesFn }, context) {
  if (!detectHooks()) {
    throw new ReferenceError('WithStylesAdapter requires React 16.8 or later');
  }

  const directionBroadcast = context ? context[DIRECTION_BROADCAST_KEY] : null;
  const direction = useBroadcast(directionBroadcast, DIRECTIONS.LTR);

  const { css, styles, theme } = useStyles({ direction, stylesFn, flushBefore });

  return children({ css, styles, theme });
}

WithStylesAdapter.propTypes = propTypes;
WithStylesAdapter.defaultProps = defaultProps;
WithStylesAdapter.contextTypes = contextTypes;

export default WithStylesAdapter;
