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

  function createStyles(isRTL) {
    const registeredTheme = ThemedStyleSheet.get();

    if (isRTL) {
      styleDefRTL = styleFn ? ThemedStyleSheet.createRTL(styleFn) : EMPTY_STYLES_FN;
      currentThemeRTL = registeredTheme;
      return styleDefRTL;
    }

    styleDefLTR = styleFn ? ThemedStyleSheet.createLTR(styleFn) : EMPTY_STYLES_FN;
    currentThemeLTR = registeredTheme;
    return styleDefLTR;
  }

  return function withStylesHOC(WrappedComponent) {
    // NOTE: Use a class here so components are ref-able if need be:
    // eslint-disable-next-line react/prefer-stateless-function
    class WithStyles extends BaseClass {
      constructor(props, context) {
        super(props, context);

        // direction needs to be stored in state in order to trigger a rerender
        // when context changes.
        this.state = {
          direction: context[CHANNEL] ? context[CHANNEL].getState() : defaultDirection,
        };
      }

      componentWillMount() {
        this.maybeCreateStyles();
      }

      componentDidMount() {
        if (this.context[CHANNEL]) {
          // subscribe to future direction changes
          this.channelUnsubscribe = this.context[CHANNEL].subscribe((direction) => {
            this.setState({ direction });
          });
        }
      }

      componentWillUnmount() {
        if (this.channelUnsubscribe) {
          this.channelUnsubscribe();
        }
      }

      getResolveMethod() {
        const { direction } = this.state;
        if (direction === DIRECTIONS.RTL) {
          return ThemedStyleSheet.resolveRTL;
        }

        return ThemedStyleSheet.resolveLTR;
      }

      maybeCreateStyles() {
        const { direction } = this.state;
        const isRTL = direction === DIRECTIONS.RTL;

        const styleDef = isRTL ? styleDefRTL : styleDefLTR;
        const currentTheme = isRTL ? currentThemeRTL : currentThemeLTR;
        const registeredTheme = ThemedStyleSheet.get();

        // Return the existing styles if they've already been defined
        // and if the theme used to create them corresponds to the theme
        // registered with ThemedStyleSheet
        if (styleDef && currentTheme === registeredTheme) {
          return styleDef;
        }

        return createStyles(isRTL);
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

        const styleDef = this.maybeCreateStyles();

        return (
          <WrappedComponent
            {...this.props}
            {...{
              [themePropName]: ThemedStyleSheet.get(),
              [stylesPropName]: styleDef(),
              [cssPropName]: this.getResolveMethod(),
            }}
          />
        );
      }
    }

    const wrappedComponentName = WrappedComponent.displayName
      || WrappedComponent.name
      || 'Component';

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
