import React from 'react';
import PropTypes from 'prop-types';
import withDirection, { withDirectionPropTypes } from 'react-with-direction';
import WithStylesContext from '../WithStylesContext';

const propTypes = {
  ...withDirectionPropTypes,
  children: PropTypes.node,
};

const defaultProps = {
  children: null,
};

/**
 * Sets the direction in WithStylesContext to the direction provided by `react-with-direction`,
 * but maintains the theme and interface already provided
 *
 * @class WithStylesDirectionAdapter
 * @extends {React.Component}
 */
// We need this to be a component to use `Component.contextType`
// eslint-disable-next-line react/prefer-stateless-function
class WithStylesDirectionAdapter extends React.Component {
  constructor(props) {
    super(props);
    this.cachedContext = undefined;
  }
  
  render() {
    const { direction, children } = this.props;
    const { stylesInterface, stylesTheme } = this.context;
    let contextValue = { stylesInterface, stylesTheme, direction };
    if (this.cachedContext) {
      const { cachedStylesInterface, cachedStylesTheme, cachedDirection } = this.cachedContext;
      if (cachedStylesInterface === stylesInterface &&
          cachedStylesTheme === stylesTheme &&
          cachedDirection === direction) {
        contextValue = this.cachedContext;
      }
    }
    this.cachedContext = contextValue;
        
    return (
      <WithStylesContext.Provider value={contextValue}>
        {children}
      </WithStylesContext.Provider>
    );
  }
}

WithStylesDirectionAdapter.propTypes = propTypes;
WithStylesDirectionAdapter.defaultProps = defaultProps;
WithStylesDirectionAdapter.contextType = WithStylesContext;

export default withDirection(WithStylesDirectionAdapter);
