/* eslint-disable no-param-reassign, no-func-assign, class-methods-use-this */

import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import getComponentName from 'airbnb-prop-types/build/helpers/getComponentName';

import EMPTY_STYLES_FN from './utils/emptyStylesFn';
import withPerf from './utils/perf';
import WithStylesContext, { DIRECTIONS } from './WithStylesContext';
import ThemedStyleSheet, { _getTheme, _getInterface } from './ThemedStyleSheet';

export { withStylesPropTypes } from './withStylesPropTypes';

/**
 * A higher order function that returns a higher order class component that injects
 * CSS-in-JS props derived from the react-with-styles theme, interface, and
 * direction provided through the WithStylesContext provider.
 *
 * The function should be used as follows:
 * `withStyles((theme) => styles, options)(Component)`
 *
 * Options can be used to rename the injected props, memoize the component, and flush
 * the styles to the styles tag (or whatever the interface implements as flush) before
 * rendering.
 *
 * @export
 * @param {Function|null|undefined} [stylesFn=EMPTY_STYLES_FN]
 * @param {Object} [{
 *     stylesPropName = 'styles',
 *     themePropName = 'theme',
 *     cssPropName = 'css',
 *     flushBefore = false,
 *     pureComponent = false,
 *   }={}]
 * @returns a higher order component that wraps the provided component and injects
 * the react-with-styles css, styles, and theme props.
 */
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
  const BaseClass = pureComponent ? React.PureComponent : React.Component;

  /** Cache for storing the result of stylesFn(theme) for all themes. */
  const stylesFnResultCacheMap = typeof WeakMap === 'undefined' ? new Map() : new WeakMap();

  // The function that wraps the provided component in a wrapper
  // component that injects the withStyles props
  return function withStylesHOC(WrappedComponent) {
    const wrappedComponentName = getComponentName(WrappedComponent);

    // The wrapper component that injects the withStyles props
    class WithStyles extends BaseClass {
      constructor(props, context) {
        super(props, context);

        /** Cache for storing the current props and objects used to derive them */
        this.cache = { rtl: {}, ltr: {} };
      }

      getCache(direction) {
        return this.cache[direction];
      }

      updateCache(direction, results) {
        this.cache[direction] = results;
      }

      getCurrentInterface() {
        // Fallback to the singleton implementation
        return (this.context && this.context.stylesInterface) || _getInterface();
      }

      getCurrentTheme() {
        // Fallback to the singleton implementation
        return (this.context && this.context.stylesTheme) || _getTheme();
      }

      getCurrentDirection() {
        return (this.context && this.context.direction) || DIRECTIONS.LTR;
      }

      makeCreate(direction, stylesInterface) {
        const directionSelector = direction === DIRECTIONS.RTL ? 'RTL' : 'LTR';
        let create = stylesInterface[`create${directionSelector}`] || stylesInterface.create;
        if (process.env.NODE_ENV !== 'production') {
          create = withPerf('create')(create);
        }
        return create;
      }

      makeResolve(direction, stylesInterface) {
        const directionSelector = direction === DIRECTIONS.RTL ? 'RTL' : 'LTR';
        let resolve = stylesInterface[`resolve${directionSelector}`] || stylesInterface.resolve;
        if (process.env.NODE_ENV !== 'production') {
          resolve = withPerf('resolve')(resolve);
        }
        return resolve;
      }

      stylesFnResult(theme) {
        // Get and store the result in the stylesFnResultsCache for the component
        // -- not the instance -- so we only apply the theme to the stylesFn
        // once per theme for this component.
        const cachedResultForTheme = stylesFnResultCacheMap.get(theme);
        const stylesFnResult = cachedResultForTheme || stylesFn(theme) || {};
        stylesFnResultCacheMap.set(theme, stylesFnResult); // cache the result of stylesFn(theme)
        return stylesFnResult;
      }

      getProps() {
        // Get the styles interface, theme, and direction from context
        const stylesInterface = this.getCurrentInterface();
        const theme = this.getCurrentTheme();
        const direction = this.getCurrentDirection();

        // Use a cache to store the interface methods and created styles by direction.
        // This way, if the theme and the interface don't change, we do not recalculate
        // styles or any other interface derivations. They are effectively only calculated
        // once per direction, until the theme or interface change.
        // Assume: always an object.
        const cache = this.getCache(direction);

        // Determine what's changed
        const interfaceChanged = !cache.stylesInterface
          || (stylesInterface && cache.stylesInterface !== stylesInterface);
        const themeChanged = cache.theme !== theme;

        // If the interface and theme haven't changed for this direction,
        // we return the cached props immediately.
        if (!interfaceChanged && !themeChanged) {
          return cache.props;
        }

        // If the theme or the interface changed, then there are some values
        // we need to recalculate. We avoid recalculating the ones we already
        // calculated in the past if the objects they're derived from have not
        // changed.
        const create = (interfaceChanged && this.makeCreate(direction, stylesInterface))
          || cache.create;
        const resolve = (interfaceChanged && this.makeResolve(direction, stylesInterface))
          || cache.resolve;
        // Derive the css function prop
        const css = (interfaceChanged && ((...args) => resolve(args))) || cache.props.css;
        // Get or calculate the themed styles from the stylesFn:
        // Uses a separate cache at the component level, not at the instance level,
        // to only apply the theme to the stylesFn once per component class per theme.
        const stylesFnResult = this.stylesFnResult(theme);
        // Derive the styles prop: recalculate it if create changed, or stylesFnResult changed
        const styles = (
          ((interfaceChanged || stylesFnResult !== cache.stylesFnResult) && create(stylesFnResult))
            || cache.props.styles
        );
        // Put the new props together
        const props = { css, styles, theme };

        // Update the cache with all the new values
        this.updateCache(direction, {
          stylesInterface,
          theme,
          create,
          resolve,
          stylesFnResult,
          props,
        });

        return props;
      }

      flush() {
        const stylesInterface = this.getCurrentInterface();
        if (stylesInterface && stylesInterface.flush) {
          stylesInterface.flush();
        }
      }

      render() {
        // We only want to re-render if the theme, stylesInterface, or direction change.
        // These values are in context so we're listening for their updates.
        // this.getProps() derives the props from the theme, stylesInterface, and direction in
        // context, and memoizes them on the instance per direction.
        const { theme, styles, css } = this.getProps();

        // Flush if specified
        if (flushBefore) {
          this.flush();
        }

        return (
          <WrappedComponent
            {...this.props}
            {...{
              [themePropName]: theme,
              [stylesPropName]: styles,
              [cssPropName]: css,
            }}
          />
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
    WithStyles.contextType = WithStylesContext;
    WithStyles.WrappedComponent = WrappedComponent;
    WithStyles.displayName = `withStyles(${wrappedComponentName})`;
    return hoistNonReactStatics(WithStyles, WrappedComponent);
  };
}

export default withStyles;

/**
* Deprecated: Do not use directly. Please wrap your component in `withStyles` and use the `css`
* prop injected via props instead.
*/
export const css = ThemedStyleSheet.resolveLTR;
