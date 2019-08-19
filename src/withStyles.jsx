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

/**
 * A higher order function that returns a higher order component that injects
 * CSS-in-JS props derived from the react-with-styles theme, interface, and
 * direction provided through the WithStylesContext provider and DirectionProvider.
 *
 * The function should be used as follows:
 * `withStyles((theme) => styles, options)(Component)`
 *
 * Options can be used to rename the injected props, memoize the component, and flush
 * the styles to the styles tag (or whatever the interface implements as flush) before
 * rendering.
 *
 * @export
 * @param {*} [stylesFn=EMPTY_STYLES_FN]
 * @param {*} [{
 *     stylesPropName = 'styles',
 *     themePropName = 'theme',
 *     cssPropName = 'css',
 *     flushBefore = false,
 *     pureComponent = false,
 *   }={}]
 * @returns a higher order component that wraps the provided component and injects
 * the react-with-styles css, styles, and theme props.
 */
export default function withStyles(
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

  // The function that wraps the provided component in a wrapper
  // component that injects the withStyles props
  return function withStylesHOC(WrappedComponent) {
    const wrappedComponentName = getComponentName(WrappedComponent);

    // The wrapper component that injects the withStyles props
    function WithStyles(props) {
      const { direction } = props;
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

    // Copy the wrapped component's prop types and default props on WithStyles
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
    // Set statics on the component
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
