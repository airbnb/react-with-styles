import React, { PropTypes } from 'react';

const propTypes = {
  children: PropTypes.node.isRequired,
  name: PropTypes.string,
};

const childContextTypes = {
  themeName: PropTypes.string,
};

export default class ThemeProvider extends React.Component {
  getChildContext() {
    return {
      themeName: this.props.name,
    };
  }

  render() {
    return React.Children.only(this.props.children);
  }
}

ThemeProvider.propTypes = propTypes;
ThemeProvider.childContextTypes = childContextTypes;
