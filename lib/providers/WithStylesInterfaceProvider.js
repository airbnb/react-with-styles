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
  stylesInterface: _propTypes["default"].obj.isRequired,
  children: _propTypes["default"].node
};
var defaultProps = {
  children: null
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

var WithStylesInterfaceProvider =
/*#__PURE__*/
function (_React$Component) {
  (0, _inheritsLoose2["default"])(WithStylesInterfaceProvider, _React$Component);

  function WithStylesInterfaceProvider() {
    return _React$Component.apply(this, arguments) || this;
  }

  var _proto = WithStylesInterfaceProvider.prototype;

  _proto.render = function render() {
    var _this$props = this.props,
        stylesInterface = _this$props.stylesInterface,
        children = _this$props.children;
    var _this$context = this.context,
        stylesTheme = _this$context.stylesTheme,
        direction = _this$context.direction;
    return _react["default"].createElement(_WithStylesContext["default"].Provider, {
      value: {
        stylesInterface: stylesInterface,
        stylesTheme: stylesTheme,
        direction: direction
      }
    }, children);
  };

  return WithStylesInterfaceProvider;
}(_react["default"].Component);

WithStylesInterfaceProvider.propTypes = propTypes;
WithStylesInterfaceProvider.defaultProps = defaultProps;
WithStylesInterfaceProvider.contextType = _WithStylesContext["default"];
var _default = WithStylesInterfaceProvider;
exports["default"] = _default;