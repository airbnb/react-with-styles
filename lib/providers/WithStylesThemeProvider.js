"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _WithStylesContext = _interopRequireDefault(require("../WithStylesContext"));

var propTypes = {
  theme: _propTypes["default"].obj.isRequired,
  children: _propTypes["default"].node
};
var defaultProps = {
  children: null
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

var WithStylesThemeProvider =
/*#__PURE__*/
function (_React$Component) {
  (0, _inheritsLoose2["default"])(WithStylesThemeProvider, _React$Component);

  function WithStylesThemeProvider() {
    return _React$Component.apply(this, arguments) || this;
  }

  var _proto = WithStylesThemeProvider.prototype;

  _proto.render = function render() {
    var _this$props = this.props,
        theme = _this$props.theme,
        children = _this$props.children;
    var _this$context = this.context,
        stylesInterface = _this$context.stylesInterface,
        direction = _this$context.direction;
    return _react["default"].createElement(_WithStylesContext["default"].Provider, {
      value: {
        stylesInterface: stylesInterface,
        stylesTheme: theme,
        direction: direction
      }
    }, children);
  };

  return WithStylesThemeProvider;
}(_react["default"].Component);

WithStylesThemeProvider.propTypes = propTypes;
WithStylesThemeProvider.defaultProps = defaultProps;
WithStylesThemeProvider.contextType = _WithStylesContext["default"];
var _default = WithStylesThemeProvider;
exports["default"] = _default;