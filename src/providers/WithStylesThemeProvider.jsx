import React from 'react';
import PropTypes from 'prop-types';
import WithStylesContext from '../WithStylesContext';

const propTypes = {
  theme: PropTypes.obj.isRequired,
  children: PropTypes.node,
};

const defaultProps = {
  children: null,
};

/**
 * Changes the theme in WithStylesContext, but maintains the interface and direction
 * already provided
 *
 * @class WithStylesThemeProvider
 * @extends {React.Component}
 */
// We need this to be a component to use `Component.contextType`
// eslint-disable-next-line react/prefer-stateless-function
class WithStylesThemeProvider extends React.Component {
  render() {
    const { theme, children } = this.props;
    const { stylesInterface, direction } = this.context;

    return (
      <WithStylesContext.Provider value={{ stylesInterface, stylesTheme: theme, direction }}>
        {children}
      </WithStylesContext.Provider>
    );
  }
}

WithStylesThemeProvider.propTypes = propTypes;
WithStylesThemeProvider.defaultProps = defaultProps;
WithStylesThemeProvider.contextType = WithStylesContext;

export default WithStylesThemeProvider;
