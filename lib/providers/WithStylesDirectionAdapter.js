"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactWithDirection = _interopRequireWildcard(require("react-with-direction"));

var _WithStylesContext = _interopRequireDefault(require("../WithStylesContext"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var propTypes = _objectSpread({}, _reactWithDirection.withDirectionPropTypes, {
  children: _propTypes["default"].node
});

var defaultProps = {
  children: null
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

var WithStylesDirectionAdapter =
/*#__PURE__*/
function (_React$Component) {
  (0, _inheritsLoose2["default"])(WithStylesDirectionAdapter, _React$Component);

  function WithStylesDirectionAdapter() {
    return _React$Component.apply(this, arguments) || this;
  }

  var _proto = WithStylesDirectionAdapter.prototype;

  _proto.render = function render() {
    var _this$props = this.props,
        direction = _this$props.direction,
        children = _this$props.children;
    var _this$context = this.context,
        stylesInterface = _this$context.stylesInterface,
        stylesTheme = _this$context.stylesTheme;
    return _react["default"].createElement(_WithStylesContext["default"].Provider, {
      value: {
        stylesInterface: stylesInterface,
        stylesTheme: stylesTheme,
        direction: direction
      }
    }, children);
  };

  return WithStylesDirectionAdapter;
}(_react["default"].Component);

WithStylesDirectionAdapter.propTypes = propTypes;
WithStylesDirectionAdapter.defaultProps = defaultProps;
WithStylesDirectionAdapter.contextType = _WithStylesContext["default"]; // eslint-disable-next-line no-underscore-dangle

var _WithStylesDirectionAdapter = (0, _reactWithDirection["default"])(WithStylesDirectionAdapter); // Have to remove the contextType the withDirection component hoists because
// it's using an old version of hoist-non-react-statics that copies it over
// TODO: remove this once withDirection updates hoist-non-react-statics


delete _WithStylesDirectionAdapter.contextType;
var _default = _WithStylesDirectionAdapter;
exports["default"] = _default;