/* eslint-disable no-param-reassign, no-func-assign, react/destructuring-assignment */

import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import getComponentName from 'airbnb-prop-types/build/helpers/getComponentName';

import WithStylesAdapter from './WithStylesAdapter';
import detectHooks from './utils/detectHooks';
import EMPTY_STYLES_FN from './utils/emptyStylesFn';

export { withStylesPropTypes } from './withStylesPropTypes';

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
export function withStylesWithHooks(
  stylesFn = EMPTY_STYLES_FN,
  {
    stylesPropName = 'styles',
    themePropName = 'theme',
    cssPropName = 'css',
    flushBefore = false,
    pureComponent = false,
  } = {},
) {
  if (!detectHooks()) {
    throw new ReferenceError('withSytlesWithHooks() requires React 16.8 or later');
  }

  stylesFn = stylesFn || EMPTY_STYLES_FN;
  const BaseClass = pureComponent ? React.PureComponent : React.Component;

  return function withStylesHOC(WrappedComponent) {
    const wrappedComponentName = getComponentName(WrappedComponent);

    // The wrapper component that injects the withStyles props
    class WithStyles extends BaseClass {
      constructor(props) {
        super(props);
        this.renderWrappedComponent = this.renderWrappedComponent.bind(this);
      }

      renderWrappedComponent({ css, styles, theme }) {
        return (
          <WrappedComponent
            {...this.props}
            {...{
              [cssPropName]: css,
              [stylesPropName]: styles,
              [themePropName]: theme,
            }}
          />
        );
      }

      render() {
        return (
          <WithStylesAdapter stylesFn={stylesFn} flushBefore={flushBefore}>
            {this.renderWrappedComponent}
          </WithStylesAdapter>
        );
      }
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

    return hoistNonReactStatics(WithStyles, WrappedComponent);
  };
}

export default withStylesWithHooks;
