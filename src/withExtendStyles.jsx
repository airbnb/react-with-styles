/* eslint react/forbid-foreign-prop-types: off */

import React from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';

export default function withExtendStyles(
  extendStyleFn,
  {
    extendStyleFnPropName = '_extendStyleFn',
  } = {},
) {
  return function withExtendStylesHOC(WrappedComponent) {
    const wrappedComponentName = WrappedComponent.displayName
      || WrappedComponent.name
      || 'Component';

    const WithExtendStyles = ({ [extendStyleFnPropName]: extendStyleFns, ...rest }) => (
      <WrappedComponent
        {...rest}
        {...{
          [extendStyleFnPropName]: [
            ...(extendStyleFn ? [extendStyleFn] : []),
            ...(extendStyleFns || []),
          ],
        }}
      />
    );

    WithExtendStyles.WrappedComponent = WrappedComponent;
    WithExtendStyles.displayName = `withExtendStyles(${wrappedComponentName})`;
    if (WrappedComponent.propTypes) {
      WithExtendStyles.propTypes = {
        [extendStyleFnPropName]: PropTypes.arrayOf(
          PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
        ),
        ...WrappedComponent.propTypes,
      };
    }
    if (WrappedComponent.defaultProps) {
      WithExtendStyles.defaultProps = { ...WrappedComponent.defaultProps };
    }

    return hoistNonReactStatics(WithExtendStyles, WrappedComponent);
  };
}
