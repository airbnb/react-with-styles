import React from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';
import deepmerge from 'deepmerge';

import { CHANNEL, DIRECTIONS } from 'react-with-direction/dist/constants';
import brcastShape from 'react-with-direction/dist/proptypes/brcast';

import ThemedStyleSheet from './ThemedStyleSheet';

// Add some named exports to assist in upgrading and for convenience
export const css = ThemedStyleSheet.resolveLTR;
export const withStylesPropTypes = {
  styles: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  theme: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  css: PropTypes.func.isRequired,
};

const EMPTY_STYLES = {};
const EMPTY_STYLES_FN = () => EMPTY_STYLES;

function baseClass(pureComponent) {
  if (pureComponent) {
    if (!React.PureComponent) {
      throw new ReferenceError('withStyles() pureComponent option requires React 15.3.0 or later');
    }

    return React.PureComponent;
  }

  return React.Component;
}

const contextTypes = {
  [CHANNEL]: brcastShape,
};

const defaultDirection = DIRECTIONS.LTR;

export function withStyles(
  styleFn,
  {
    stylesPropName = 'styles',
    themePropName = 'theme',
    cssPropName = 'css',
    flushBefore = false,
    pureComponent = false,
  } = {},
) {
  let styleDefLTR;
  let styleDefRTL;
  let currentThemeLTR;
  let currentThemeRTL;
  const BaseClass = baseClass(pureComponent);

  function getResolveMethod(direction) {
    return direction === DIRECTIONS.LTR
      ? ThemedStyleSheet.resolveLTR
      : ThemedStyleSheet.resolveRTL;
  }

  function getCurrentTheme(direction) {
    return direction === DIRECTIONS.LTR
      ? currentThemeLTR
      : currentThemeRTL;
  }

  function getStyleDef(direction, wrappedComponentName) {
    const currentTheme = getCurrentTheme(direction);
    let styleDef = direction === DIRECTIONS.LTR
      ? styleDefLTR
      : styleDefRTL;

    const registeredTheme = ThemedStyleSheet.get();

    // Return the existing styles if they've already been defined
    // and if the theme used to create them corresponds to the theme
    // registered with ThemedStyleSheet
    if (styleDef && currentTheme === registeredTheme) {
      return styleDef;
    }

    if (
      process.env.NODE_ENV !== 'production'
      && typeof performance !== 'undefined'
      && performance.mark !== undefined
    ) {
      performance.mark('react-with-styles.createStyles.start');
    }

    const isRTL = direction === DIRECTIONS.RTL;

    if (isRTL) {
      styleDefRTL = styleFn
        ? ThemedStyleSheet.createRTL(styleFn)
        : EMPTY_STYLES_FN;

      currentThemeRTL = registeredTheme;
      styleDef = styleDefRTL;
    } else {
      styleDefLTR = styleFn
        ? ThemedStyleSheet.createLTR(styleFn)
        : EMPTY_STYLES_FN;

      currentThemeLTR = registeredTheme;
      styleDef = styleDefLTR;
    }

    if (
      process.env.NODE_ENV !== 'production'
      && typeof performance !== 'undefined'
      && performance.mark !== undefined
    ) {
      performance.mark('react-with-styles.createStyles.end');

      performance.measure(
        `\ud83d\udc69\u200d\ud83c\udfa8 withStyles(${wrappedComponentName}) [create styles]`,
        'react-with-styles.createStyles.start',
        'react-with-styles.createStyles.end',
      );
    }

    return styleDef;
  }

  function getState(direction, wrappedComponentName) {
    return {
      resolveMethod: getResolveMethod(direction),
      styleDef: getStyleDef(direction, wrappedComponentName),
    };
  }

  return function withStylesHOC(WrappedComponent) {
    const wrappedComponentName = WrappedComponent.displayName
      || WrappedComponent.name
      || 'Component';

    // NOTE: Use a class here so components are ref-able if need be:
    // eslint-disable-next-line react/prefer-stateless-function
    class WithStyles extends BaseClass {
      constructor(props, context) {
        super(props, context);

        const direction = this.context[CHANNEL]
          ? this.context[CHANNEL].getState()
          : defaultDirection;

        this.state = getState(direction, wrappedComponentName);
      }

      componentDidMount() {
        if (this.context[CHANNEL]) {
          // subscribe to future direction changes
          this.channelUnsubscribe = this.context[CHANNEL].subscribe((direction) => {
            this.setState(getState(direction, wrappedComponentName));
          });
        }
      }

      componentWillUnmount() {
        if (this.channelUnsubscribe) {
          this.channelUnsubscribe();
        }
      }

      render() {
        // As some components will depend on previous styles in
        // the component tree, we provide the option of flushing the
        // buffered styles (i.e. to a style tag) **before** the rendering
        // cycle begins.
        //
        // The interfaces provide the optional "flush" method which
        // is run in turn by ThemedStyleSheet.flush.
        if (flushBefore) {
          ThemedStyleSheet.flush();
        }

        const {
          resolveMethod,
          styleDef,
        } = this.state;

        return (
          <WrappedComponent
            {...this.props}
            {...{
              [themePropName]: ThemedStyleSheet.get(),
              [stylesPropName]: styleDef(),
              [cssPropName]: resolveMethod,
            }}
          />
        );
      }
    }

    WithStyles.WrappedComponent = WrappedComponent;
    WithStyles.displayName = `withStyles(${wrappedComponentName})`;
    WithStyles.contextTypes = contextTypes;
    if (WrappedComponent.propTypes) {
      WithStyles.propTypes = deepmerge({}, WrappedComponent.propTypes);
      delete WithStyles.propTypes[stylesPropName];
      delete WithStyles.propTypes[themePropName];
      delete WithStyles.propTypes[cssPropName];
    }
    if (WrappedComponent.defaultProps) {
      WithStyles.defaultProps = deepmerge({}, WrappedComponent.defaultProps);
    }

    return hoistNonReactStatics(WithStyles, WrappedComponent);
  };
}
