import React from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';
import deepmerge from 'deepmerge';

import { CHANNEL, DIRECTIONS } from 'react-with-direction/dist/constants';
import brcastShape from 'react-with-direction/dist/proptypes/brcast';

import ThemedStyleSheet from './ThemedStyleSheet';

// Add some named exports for convenience.
export const css = ThemedStyleSheet.resolve;
export const cssNoRTL = ThemedStyleSheet.resolveNoRTL;
export const withStylesPropTypes = {
  styles: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  theme: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
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

export function withStyles(
  styleFn,
  {
    stylesPropName = 'styles',
    themePropName = 'theme',
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

    styleDefLTR = styleFn ? ThemedStyleSheet.create(styleFn) : EMPTY_STYLES_FN;
    currentThemeLTR = registeredTheme;
    return styleDefLTR;
  }

  return function withStylesHOC(WrappedComponent) {
    // NOTE: Use a class here so components are ref-able if need be:
    // eslint-disable-next-line react/prefer-stateless-function
    class WithStyles extends BaseClass {
      componentWillMount() {
        this.maybeCreateStyles();
      }

      maybeCreateStyles() {
        const direction = this.context[CHANNEL] && this.context[CHANNEL].getState();
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
    }
    if (WrappedComponent.defaultProps) {
      WithStyles.defaultProps = deepmerge({}, WrappedComponent.defaultProps);
    }

    return hoistNonReactStatics(WithStyles, WrappedComponent);
  };
}
