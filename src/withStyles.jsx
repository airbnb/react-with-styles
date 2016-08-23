/**
 * This is a higher-order function that returns a higher-order component used to
 * wrap React components to add styles using the theme provided from context. We
 * use this to abstract away the context, to make themed styles easier to work
 * with.
 *
 * Example usage:
 *
 *   function MyComponent({ styles }) {
 *     return (
 *       <div {...css(styles.container)}>
 *         Try to be a rainbow in someone's cloud.
 *       </div>
 *     );
 *   }
 *
 *   export default withStyles(({ color, unit }) => ({
 *     container: {
 *       color: color.primary,
 *       marginBottom: 2 * unit,
 *     },
 *   }))(MyComponent);
 *
 * Or, as a decorator:
 *
 *   @withStyles(({ color, unit }) => ({
 *     container: {
 *       color: color.primary,
 *       marginBottom: 2 * unit,
 *     },
 *   }))
 *   export default function MyComponent({ styles }) {
 *     return (
 *       <div {...css(styles.container)}>
 *         Try to be a rainbow in someone's cloud.
 *       </div>
 *     );
 *   }
 *
 * By default this will pass down the styles to the wrapped component in the
 * `styles` prop, but the name of this prop can be customized by setting the
 * `stylesPropName` option.
 *
 *   function MyComponent({ classNames }) {
 *     return (
 *       <div {...css(classNames.container)}>
 *         Try to be a rainbow in someone's cloud.
 *       </div>
 *     );
 *   }
 *
 *   export default withStyles(({ color, unit }) => ({
 *     container: {
 *       color: color.primary,
 *       marginBottom: 2 * unit,
 *     },
 *   }), { stylesPropName: 'classNames' })(MyComponent);
 *
 * The theme is also passed down so components can use variables from the theme
 * outside of Aphrodite styles (e.g. as props to other components). The theme
 * prop name can also be customized by setting the `themePropName` option.
 *
 *   function MyComponent({ classNames, themeThings }) {
 *     return (
 *       <div {...css(classNames.container)}>
 *         <Background color={themeThings.color.primary}>
 *           Try to be a rainbow in someone's cloud.
 *         </Background>
 *       </div>
 *     );
 *   }
 *
 *   export default withStyles(({ color, unit }) => ({
 *     container: {
 *       color: color.primary,
 *       marginBottom: 2 * unit,
 *     },
 *   }), { stylesPropName: 'classNames', themePropName: 'themeThings' })(MyComponent);
 */

import React, { PropTypes } from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { flushToStyleTag } from 'aphrodite/lib/inject';

import ThemedStyleSheet from './ThemedStyleSheet';

const contextTypes = {
  themeName: PropTypes.string,
};

export const css = ThemedStyleSheet.resolve;

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

        // TODO we need to not depend on aphrodite directly in this component.
        //
        // Be default, Aphrodite will buffer the styles resulting from all
        // invocations of css and flush those styles to the style tag
        // asynchronousely after render. For components that depdend upon all
        // previous styles in the component tree (i.e. for calculating container
        // width, including padding/margin), we give them the option of flushing
        // all current buffered styles to the style tag before their rendering
        // lifecycle begins. The flushBefore option exposes this functionality.
        if (flushBefore) {
          flushToStyleTag();
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
