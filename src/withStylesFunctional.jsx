/* eslint-disable no-param-reassign, no-func-assign, react/destructuring-assignment */

import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import getComponentName from 'airbnb-prop-types/build/helpers/getComponentName';

import useStyles from './hooks/useStyles';
import detectHooks from './hooks/detectHooks';
import EMPTY_STYLES_FN from './utils/emptyStylesFn';

export { withStylesPropTypes } from './withStylesPropTypes';

/**
 * A higher order function that returns a higher order functional component that injects
 * CSS-in-JS props derived from the react-with-styles theme, interface, and
 * direction provided through the FunctionalWithStylesContext provider.
 *
 * The function should be used as follows:
 * `withStylesFunctional((theme) => styles, options)(Component)`
 *
 * Options can be used to rename the injected props, memoize the component, and flush
 * the styles to the styles tag (or whatever the interface implements as flush) before
 * rendering.
 *
 * Note that this implementation does not use caching for stylesFn(theme) results, so
 * use this if you are not relying on this performance optimization that currently exists
 * in the class implementation of withStyles.
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
  return function withStylesFunctionalHOC(WrappedComponent) {
    const wrappedComponentName = getComponentName(WrappedComponent);

    // The wrapper component that injects the withStyles props
    function FunctionalWithStyles(props) {
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

    // Copy the wrapped component's prop types and default props on FunctionalWithStyles
    if (WrappedComponent.propTypes) {
      FunctionalWithStyles.propTypes = { ...WrappedComponent.propTypes };
      delete FunctionalWithStyles.propTypes[stylesPropName];
      delete FunctionalWithStyles.propTypes[themePropName];
      delete FunctionalWithStyles.propTypes[cssPropName];
    }
    if (WrappedComponent.defaultProps) {
      FunctionalWithStyles.defaultProps = { ...WrappedComponent.defaultProps };
    }
    FunctionalWithStyles.WrappedComponent = WrappedComponent;
    FunctionalWithStyles.displayName = `withStyles(${wrappedComponentName})`;
    return hoistNonReactStatics(FunctionalWithStyles, WrappedComponent);
  };
}

export default withStylesFunctional;
