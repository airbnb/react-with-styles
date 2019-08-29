/* eslint-disable no-param-reassign, no-func-assign, react/destructuring-assignment */

import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import getComponentName from 'airbnb-prop-types/build/helpers/getComponentName';

import useStyles from './hooks/useStyles';
import detectHooks from './hooks/detectHooks';

export { withStylesPropTypes } from './withStylesPropTypes';

const EMPTY_STYLES = {};
const EMPTY_STYLES_FN = () => EMPTY_STYLES;

/**
 * A higher order function that returns a higher order functional component that injects
 * CSS-in-JS props derived from the react-with-styles theme, interface, and
 * direction provided through the WithStylesContext provider.
 *
 * The function should be used as follows:
 * `withStylesFunctional((theme) => styles, options)(Component)`
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
export function withStylesFunctional(
  stylesFn = EMPTY_STYLES_FN,
  {
    stylesPropName = 'styles',
    themePropName = 'theme',
    cssPropName = 'css',
    flushBefore = false,
  } = {},
) {
  stylesFn = stylesFn || EMPTY_STYLES_FN;

  if (!detectHooks()) {
    throw new ReferenceError('withStylesFunctional() requires React 16.8 or later');
  }

  // The function that wraps the provided component in a wrapper
  // component that injects the withStyles props
  return function withStylesHOC(WrappedComponent) {
    const wrappedComponentName = getComponentName(WrappedComponent);

    // The wrapper component that injects the withStyles props
    function WithStyles(props) {
      const { css, styles, theme } = useStyles({ stylesFn, flushBefore });

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

    // Copy the wrapped component's prop types and default props on WithStyles
    if (WrappedComponent.propTypes) {
      WithStyles.propTypes = { ...WrappedComponent.propTypes };
      delete WithStyles.propTypes[stylesPropName];
      delete WithStyles.propTypes[themePropName];
      delete WithStyles.propTypes[cssPropName];
    }
    if (WrappedComponent.defaultProps) {
      WithStyles.defaultProps = { ...WrappedComponent.defaultProps };
    }
    WithStyles.WrappedComponent = WrappedComponent;
    WithStyles.displayName = `withStyles(${wrappedComponentName})`;
    WithStyles = hoistNonReactStatics(WithStyles, WrappedComponent);
    return WithStyles;
  };
}

export default withStylesFunctional;
