/* eslint-disable no-param-reassign */

import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import getComponentName from 'airbnb-prop-types/build/helpers/getComponentName';
import ref from 'airbnb-prop-types/build/ref';

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

  function getOrCreateStylesFnResultCache(theme) {
    // Get and store the result in the stylesFnResultsCache for the component
    // -- not the instance -- so we only apply the theme to the stylesFn
    // once per theme for this component.
    const cachedResultForTheme = stylesFnResultCacheMap.get(theme);
    const stylesFnResult = cachedResultForTheme || stylesFn(theme) || {};
    stylesFnResultCacheMap.set(theme, stylesFnResult); // cache the result of stylesFn(theme)
    return stylesFnResult;
  }

  /**
   * Cache for storing the results of computations:
   * `WeakMap<Theme, WeakMap<typeof WithStyles, { ltr: {}, rtl: {} }>>`
   * Falling back to `Map` whenever `WeakMap` is not supported
   */
  const withStylesCache = typeof WeakMap === 'undefined' ? new Map() : new WeakMap();

  function getComponentCache(theme, component, direction) {
    const themeCache = withStylesCache.get(theme);
    if (!themeCache) {
      return null;
    }
    const componentCache = themeCache.get(component);
    if (!componentCache) {
      return null;
    }
    return componentCache[direction];
  }

  function updateComponentCache(theme, component, direction, results) {
    let themeCache = withStylesCache.get(theme);
    if (!themeCache) {
      themeCache = typeof WeakMap === 'undefined' ? new Map() : new WeakMap();
      withStylesCache.set(theme, themeCache);
    }
    let componentCache = themeCache.get(component);
    if (!componentCache) {
      componentCache = { ltr: {}, rtl: {} };
      themeCache.set(component, componentCache);
    }

    componentCache[direction] = results;
  }

  /** Derive the create function from the interface and direction */
  function makeCreateFn(direction, stylesInterface) {
    const directionSelector = direction === DIRECTIONS.RTL ? 'RTL' : 'LTR';
    let create = stylesInterface[`create${directionSelector}`] || stylesInterface.create;
    const original = create;
    if (process.env.NODE_ENV !== 'production') {
      create = withPerf('create')(create);
    }
    return { create, original };
  }

  /** Derive the resolve function from the interface and direction */
  function makeResolveFn(direction, stylesInterface) {
    const directionSelector = direction === DIRECTIONS.RTL ? 'RTL' : 'LTR';
    let resolve = stylesInterface[`resolve${directionSelector}`] || stylesInterface.resolve;
    const original = resolve;
    if (process.env.NODE_ENV !== 'production') {
      resolve = withPerf('resolve')(resolve);
    }
    return { resolve, original };
  }

  // The function that wraps the provided component in a wrapper
  // component that injects the withStyles props
  return function withStylesHOC(WrappedComponent) {
    const wrappedComponentName = getComponentName(WrappedComponent);

    // The wrapper component that injects the withStyles props
    class WithStyles extends BaseClass {
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
        const componentCache = getComponentCache(theme, WithStyles, direction);

        // Determine what's changed
        const interfaceChanged = !componentCache
          || !componentCache.stylesInterface
          || (stylesInterface && componentCache.stylesInterface !== stylesInterface);
        const themeChanged = !componentCache || componentCache.theme !== theme;

        // If the interface and theme haven't changed for this direction,
        // we return the cached props immediately.
        if (!interfaceChanged && !themeChanged) {
          return componentCache.props;
        }

        // If the theme or the interface changed, then there are some values
        // we need to recalculate. We avoid recalculating the ones we already
        // calculated in the past if the objects they're derived from have not
        // changed.
        const createFn = (interfaceChanged && makeCreateFn(direction, stylesInterface))
          || componentCache.create;
        const resolveFn = (interfaceChanged && makeResolveFn(direction, stylesInterface))
          || componentCache.resolve;

        const { create } = createFn;
        const { resolve } = resolveFn;

        // Determine if create or resolve functions have changed, which will then
        // determine if we need to create new styles or css props
        const createChanged = !componentCache || !componentCache.create
          || createFn.original !== componentCache.create.original;
        const resolveChanged = !componentCache || !componentCache.resolve
          || resolveFn.original !== componentCache.resolve.original;

        // Derive the css function prop: recalculate it if resolve changed
        const css = (resolveChanged && ((...args) => resolve(args)))
          || componentCache.props.css;
        // Get or calculate the themed styles from the stylesFn:
        // Uses a separate cache at the component level, not at the instance level,
        // to only apply the theme to the stylesFn once per component class per theme.
        const stylesFnResult = getOrCreateStylesFnResultCache(theme);
        // Derive the styles prop: recalculate it if create changed, or stylesFnResult changed
        const styles = ((createChanged || stylesFnResult !== componentCache.stylesFnResult)
          && create(stylesFnResult))
          || componentCache.props.styles;
        // Put the new props together
        const props = { css, styles, theme };

        // Update the cache with all the new values
        updateComponentCache(theme, WithStyles, direction, {
          stylesInterface,
          theme,
          create: createFn,
          resolve: resolveFn,
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

        const { forwardedRef, ...rest } = this.props;

        return (
          <WrappedComponent
            // TODO: remove conditional once breaking change to only support React 16.3+
            // ref: https://github.com/airbnb/react-with-styles/pull/240#discussion_r533497857
            ref={typeof React.forwardRef === 'undefined' ? undefined : forwardedRef}
            {...(typeof React.forwardRef === 'undefined' ? this.props : rest)}
            {...{
              [themePropName]: theme,
              [stylesPropName]: styles,
              [cssPropName]: css,
            }}
          />
        );
      }
    }

    // TODO: remove conditional once breaking change to only support React 16.3+
    // ref: https://github.com/airbnb/react-with-styles/pull/240#discussion_r533497857
    if (typeof React.forwardRef !== 'undefined') {
      WithStyles.propTypes = {
        forwardedRef: ref(),
      };
    }

    // TODO: remove conditional once breaking change to only support React 16.3+
    // ref: https://github.com/airbnb/react-with-styles/pull/240#discussion_r533497857
    const ForwardedWithStyles = typeof React.forwardRef === 'undefined'
      ? WithStyles
      : React.forwardRef((props, forwardedRef) => (
        <WithStyles {...props} forwardedRef={forwardedRef} />
      ));

    // Copy the wrapped component's prop types and default props on WithStyles
    if (WrappedComponent.propTypes) {
      ForwardedWithStyles.propTypes = { ...WrappedComponent.propTypes };
      delete ForwardedWithStyles.propTypes[stylesPropName];
      delete ForwardedWithStyles.propTypes[themePropName];
      delete ForwardedWithStyles.propTypes[cssPropName];
    }
    if (WrappedComponent.defaultProps) {
      ForwardedWithStyles.defaultProps = { ...WrappedComponent.defaultProps };
    }
    WithStyles.contextType = WithStylesContext;
    ForwardedWithStyles.WrappedComponent = WrappedComponent;
    ForwardedWithStyles.displayName = `withStyles(${wrappedComponentName})`;

    return hoistNonReactStatics(ForwardedWithStyles, WrappedComponent);
  };
}

export default withStyles;

/**
 * Deprecated: Do not use directly. Please wrap your component in `withStyles` and use the `css`
 * prop injected via props instead.
 */
export const css = ThemedStyleSheet.resolveLTR;
