import React from 'react';
import PropTypes from 'prop-types';
import WithStylesContext from '../WithStylesContext';

const propTypes = {
  stylesInterface: PropTypes.obj.isRequired,
  children: PropTypes.node,
};

const defaultProps = {
  children: null,
};

/**
 * Changes the interface in WithStylesContext, but maintains the theme and direction
 * already provided
 *
 * @class WithStylesInterfaceProvider
 * @extends {React.Component}
 */
// We need this to be a component to use `Component.contextType`:
// eslint-disable-next-line react/prefer-stateless-function
class WithStylesInterfaceProvider extends React.Component {
  render() {
    const { stylesInterface, children } = this.props;
    const { stylesTheme, direction } = this.context;

    return (
      <WithStylesContext.Provider value={{ stylesInterface, stylesTheme, direction }}>
        {children}
      </WithStylesContext.Provider>
    );
  }
}

WithStylesInterfaceProvider.propTypes = propTypes;
WithStylesInterfaceProvider.defaultProps = defaultProps;
WithStylesInterfaceProvider.contextType = WithStylesContext;

export default WithStylesInterfaceProvider;
