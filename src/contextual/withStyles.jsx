/* eslint-disable react/forbid-foreign-prop-types */

import React, { useMemo, useContext, memo } from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';
import withDirection from 'react-with-direction';

import StylesThemeContext from './StylesThemeContext';
import StylesInterfaceContext from './StylesInterfaceContext';
import useThemedStyleSheet from './useThemedStyleSheet';
import { perfStart, perfEnd } from './perf';

export const withStylesPropTypes = {
  styles: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  css: PropTypes.func.isRequired,
};

const EMPTY_STYLES = {};
const EMPTY_STYLES_FN = () => EMPTY_STYLES;

const CREATE_START_MARK = 'react-with-styles.createStyles.start';
const CREATE_END_MARK = 'react-with-styles.createStyles.end';
const createMeasureName = wrappedComponentName => `\ud83d\udc69\u200d\ud83c\udfa8 withStyles(${wrappedComponentName}) [create styles]`;

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
  // eslint-disable-next-line no-param-reassign
  stylesFn = stylesFn || EMPTY_STYLES_FN;

  return function withStylesHOC(WrappedComponent) {
    const wrappedComponentName = WrappedComponent.displayName
      || WrappedComponent.name
      || 'Component';

    function WithStyles(props) {
      // Use global state
      const { direction } = props;
      const stylesInterface = useContext(StylesInterfaceContext);
      const theme = useContext(StylesThemeContext);

      // Create and cache the ThemedStyleSheet for this combination of global state values. We are
      // going to be using the functions provided by this interface to inject the withStyles props.
      const { create, resolve: css, flush } = useThemedStyleSheet({
        direction,
        stylesInterface,
        theme,
      });

      // Flush styles to the style tag if needed. This must happen as early as possible in the
      // render cycle.
      if (flushBefore) {
        flush();
      }

      if (process.env.NODE_ENV !== 'production') perfStart(CREATE_START_MARK);

      // Calculate and cache the styles definition for this combination of global state values. This
      // value will only be recalculated if the create function changes, which in turn will only
      // change if any of the global state we depend on changes.
      const styles = useMemo(() => create(stylesFn), [create]);

      if (process.env.NODE_ENV !== 'production') {
        perfEnd(CREATE_START_MARK, CREATE_END_MARK, createMeasureName(wrappedComponentName));
      }

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

    // Listen to directional updates via props
    // eslint-disable-next-line no-func-assign
    WithStyles = withDirection(WithStyles);

    // Make into a pure functional component if requested
    // eslint-disable-next-line no-func-assign
    WithStyles = pureComponent ? memo(WithStyles) : WithStyles;

    // Set React statics on WithStyles
    WithStyles.WrappedComponent = WrappedComponent;
    WithStyles.displayName = `withStyles(${wrappedComponentName})`;
    if (WrappedComponent.propTypes) {
      WithStyles.propTypes = { ...WrappedComponent.propTypes };
      delete WithStyles.propTypes[stylesPropName];
      delete WithStyles.propTypes[themePropName];
      delete WithStyles.propTypes[cssPropName];
    }
    if (WrappedComponent.defaultProps) {
      WithStyles.defaultProps = { ...WrappedComponent.defaultProps };
    }

    // Copy all non-React static members of WrappedComponent to WithStyles
    // eslint-disable-next-line no-func-assign
    WithStyles = hoistNonReactStatics(WithStyles, WrappedComponent);

    return WithStyles;
  };
}

export default withStyles;
