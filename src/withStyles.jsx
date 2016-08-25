import React, { PropTypes } from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';

import ThemeProvider from './ThemeProvider';
import ThemedStyleSheet from './ThemedStyleSheet';

// Add some named exports for convenience.
export { ThemeProvider };
export const css = ThemedStyleSheet.resolve;

const contextTypes = {
  themeName: PropTypes.string,
};

export function withStyles(
  styleFn,
  {
    stylesPropName = 'styles',
    themePropName = 'theme',
    flushBefore = false,
  } = {}
) {
  const styleDef = styleFn && ThemedStyleSheet.create(styleFn);

  return function withStylesHOC(WrappedComponent) {
    // NOTE: Use a class here so components are ref-able if need be:
    // eslint-disable-next-line react/prefer-stateless-function
    class WithStyles extends React.Component {
      render() {
        const props = this.props;
        const { themeName } = this.context;

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

        const addedProps = {
          [themePropName]: ThemedStyleSheet.get(themeName),
        };

        if (styleDef) {
          addedProps[stylesPropName] = styleDef(themeName);
        }

        return <WrappedComponent {...props} {...addedProps} />;
      }
    }

    const wrappedComponentName = WrappedComponent.displayName
      || WrappedComponent.name
      || 'Component';

    WithStyles.WrappedComponent = WrappedComponent;
    WithStyles.contextTypes = contextTypes;
    WithStyles.displayName = `withStyles(${wrappedComponentName})`;

    return hoistNonReactStatics(WithStyles, WrappedComponent);
  };
}
