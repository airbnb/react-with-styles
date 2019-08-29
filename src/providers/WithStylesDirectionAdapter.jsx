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
  render() {
    const { direction, children } = this.props;
    const { stylesInterface, stylesTheme } = this.context;

    return (
      <WithStylesContext.Provider value={{ stylesInterface, stylesTheme, direction }}>
        {children}
      </WithStylesContext.Provider>
    );
  }
}

WithStylesDirectionAdapter.propTypes = propTypes;
WithStylesDirectionAdapter.defaultProps = defaultProps;
WithStylesDirectionAdapter.contextType = WithStylesContext;

// eslint-disable-next-line no-underscore-dangle
const _WithStylesDirectionAdapter = withDirection(WithStylesDirectionAdapter);

// Have to remove the contextType the withDirection component hoists because
// it's using an old version of hoist-non-react-statics that copies it over
// TODO: remove this once withDirection updates hoist-non-react-statics
delete _WithStylesDirectionAdapter.contextType;

export default _WithStylesDirectionAdapter;
