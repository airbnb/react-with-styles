/* eslint-disable react/forbid-foreign-prop-types, no-param-reassign, no-func-assign */

import React from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';
import withDirection, { withDirectionPropTypes, DIRECTIONS } from 'react-with-direction';
import getComponentName from 'airbnb-prop-types/build/helpers/getComponentName';

import useStyles from './useStyles';

export const withStylesPropTypes = {
  styles: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  css: PropTypes.func.isRequired,
  ...withDirectionPropTypes,
};

export const withStylesDefaultProps = {
  direction: DIRECTIONS.LTR,
};

const EMPTY_STYLES = {};
const EMPTY_STYLES_FN = () => EMPTY_STYLES;

export function withStyles(
  stylesFn = EMPTY_STYLES_FN,
  {
    stylesPropName = 'styles',
    themePropName = 'theme',
    cssPropName = 'css',
    flushBefore = false,
    pureComponent = false,
  } = {},
) {
  stylesFn = stylesFn || EMPTY_STYLES_FN;

  return function withStylesHOC(WrappedComponent) {
    const wrappedComponentName = getComponentName(WrappedComponent);

    function WithStyles(props) {
      // Use global state
      const { direction } = props;

      // Create and cache the ThemedStyleSheet for this combination of global state values. We are
      // going to be using the functions provided by this interface to inject the withStyles props.
      // See `useThemedStyleSheet` for more details.
      const { css, styles, theme } = useStyles({ direction, stylesFn, flushBefore });

      return (
        <WrappedComponent
          {...props}
          {...{
            [themePropName]: theme,
            [stylesPropName]: styles,
            [cssPropName]: css,
          }}
        />
      );
    }

    // Listen to directional updates via props
    WithStyles = withDirection(WithStyles);

    // Copy React statics on WithStyles
    if (WrappedComponent.propTypes) {
      WithStyles.propTypes = { ...WrappedComponent.propTypes };
      delete WithStyles.propTypes[stylesPropName];
      delete WithStyles.propTypes[themePropName];
      delete WithStyles.propTypes[cssPropName];
    }
    if (WrappedComponent.defaultProps) {
      WithStyles.defaultProps = {
        ...withStylesDefaultProps,
        ...WrappedComponent.defaultProps,
      };
    }

    WithStyles.WrappedComponent = WrappedComponent;
    WithStyles.displayName = `withStyles(${wrappedComponentName})`;
    WithStyles = hoistNonReactStatics(WithStyles, WrappedComponent);

    // Make into a pure functional component if requested
    if (pureComponent) {
      WithStyles = React.memo(WithStyles);

      // We set statics on the memoized component as well because the
      // React.memo HOC doesn't copy them over
      WithStyles.WrappedComponent = WrappedComponent;
      WithStyles.displayName = `withStyles(${wrappedComponentName})`;
      WithStyles = hoistNonReactStatics(WithStyles, WrappedComponent);
    }

    return WithStyles;
  };
}

export default withStyles;
