import React, { PropTypes } from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import deepmerge from 'deepmerge';

import ThemeProvider from './ThemeProvider';
import ThemedStyleSheet from './ThemedStyleSheet';

// Add some named exports for convenience.
export { ThemeProvider };
export const css = ThemedStyleSheet.resolve;

const contextTypes = {
  themeName: PropTypes.string,
};

function baseClass(pureComponent) {
  if (pureComponent) {
    if (!React.PureComponent) {
      throw new ReferenceError('withStyles() pureComponent option requires React 15.3.0 or later');
    }

    return React.PureComponent;
  }

  return React.Component;
}

export function withStyles(
  styleFn,
  {
    stylesPropName = 'styles',
    themePropName = 'theme',
    flushBefore = false,
    pureComponent = false,
  } = {},
) {
  const styleDef = styleFn && ThemedStyleSheet.create(styleFn);
  const BaseClass = baseClass(pureComponent);

  function getAddedProps(themeName) {
    const addedProps = {
      [themePropName]: ThemedStyleSheet.get(themeName),
    };

    if (styleDef) {
      addedProps[stylesPropName] = styleDef(themeName);
    }

    return addedProps;
  }

  return function withStylesHOC(WrappedComponent) {
    class WithStyles extends BaseClass {
      constructor(props, context) {
        super(props, context);

        this.state = getAddedProps(context.themeName);
      }

      componentWillReceiveProps(nextProps, nextContext) {
        if (this.context.themeName !== nextContext.themeName) {
          this.setState(getAddedProps(nextContext.themeName));
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

        return <WrappedComponent {...this.props} {...this.state} />;
      }
    }

    const wrappedComponentName = WrappedComponent.displayName
      || WrappedComponent.name
      || 'Component';

    WithStyles.WrappedComponent = WrappedComponent;
    WithStyles.contextTypes = contextTypes;
    WithStyles.displayName = `withStyles(${wrappedComponentName})`;
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
