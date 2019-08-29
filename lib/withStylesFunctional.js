"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.withStylesFunctional = withStylesFunctional;
Object.defineProperty(exports, "withStylesPropTypes", {
  enumerable: true,
  get: function get() {
    return _withStylesPropTypes.withStylesPropTypes;
  }
});
exports["default"] = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _hoistNonReactStatics = _interopRequireDefault(require("hoist-non-react-statics"));

var _getComponentName = _interopRequireDefault(require("airbnb-prop-types/build/helpers/getComponentName"));

var _useStyles2 = _interopRequireDefault(require("./hooks/useStyles"));

var _detectHooks = _interopRequireDefault(require("./hooks/detectHooks"));

var _emptyStylesFn = _interopRequireDefault(require("./utils/emptyStylesFn"));

var _withStylesPropTypes = require("./withStylesPropTypes");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

/**
 * A higher order function that returns a higher order functional component that injects
 * CSS-in-JS props derived from the react-with-styles theme, interface, and
 * direction provided through the FunctionalWithStylesContext provider.
 *
 * The function should be used as follows:
 * `withStylesFunctional((theme) => styles, options)(Component)`
 *
 * Options can be used to rename the injected props, memoize the component, and flush
 * the styles to the styles tag (or whatever the interface implements as flush) before
 * rendering.
 *
 * Note that this implementation does not use caching for stylesFn(theme) results, so
 * use this if you are not relying on this performance optimization that currently exists
 * in the class implementation of withStyles.
 *
 * @export
 * @param {*} [stylesFn=EMPTY_STYLES_FN]
 * @param {*} [{
 *     stylesPropName = 'styles',
 *     themePropName = 'theme',
 *     cssPropName = 'css',
 *     flushBefore = false,
 *     pureComponent = false,
 *   }={}]
 * @returns a higher order component that wraps the provided component and injects
 * the react-with-styles css, styles, and theme props.
 */
function withStylesFunctional() {
  var stylesFn = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _emptyStylesFn["default"];

  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$stylesPropName = _ref.stylesPropName,
      stylesPropName = _ref$stylesPropName === void 0 ? 'styles' : _ref$stylesPropName,
      _ref$themePropName = _ref.themePropName,
      themePropName = _ref$themePropName === void 0 ? 'theme' : _ref$themePropName,
      _ref$cssPropName = _ref.cssPropName,
      cssPropName = _ref$cssPropName === void 0 ? 'css' : _ref$cssPropName,
      _ref$flushBefore = _ref.flushBefore,
      flushBefore = _ref$flushBefore === void 0 ? false : _ref$flushBefore;

  stylesFn = stylesFn || _emptyStylesFn["default"];

  if (!(0, _detectHooks["default"])()) {
    throw new ReferenceError('withStylesFunctional() requires React 16.8 or later');
  } // The function that wraps the provided component in a wrapper
  // component that injects the withStyles props


  return function withStylesFunctionalHOC(WrappedComponent) {
    var wrappedComponentName = (0, _getComponentName["default"])(WrappedComponent); // The wrapper component that injects the withStyles props

    function FunctionalWithStyles(props) {
      var _ref2;

      var _useStyles = (0, _useStyles2["default"])({
        stylesFn: stylesFn,
        flushBefore: flushBefore
      }),
          css = _useStyles.css,
          styles = _useStyles.styles,
          theme = _useStyles.theme;

      return _react["default"].createElement(WrappedComponent, (0, _extends2["default"])({}, props, (_ref2 = {}, (0, _defineProperty2["default"])(_ref2, themePropName, theme), (0, _defineProperty2["default"])(_ref2, stylesPropName, styles), (0, _defineProperty2["default"])(_ref2, cssPropName, css), _ref2)));
    } // Copy the wrapped component's prop types and default props on FunctionalWithStyles


    if (WrappedComponent.propTypes) {
      FunctionalWithStyles.propTypes = _objectSpread({}, WrappedComponent.propTypes);
      delete FunctionalWithStyles.propTypes[stylesPropName];
      delete FunctionalWithStyles.propTypes[themePropName];
      delete FunctionalWithStyles.propTypes[cssPropName];
    }

    if (WrappedComponent.defaultProps) {
      FunctionalWithStyles.defaultProps = _objectSpread({}, WrappedComponent.defaultProps);
    }

    FunctionalWithStyles.WrappedComponent = WrappedComponent;
    FunctionalWithStyles.displayName = "withStyles(".concat(wrappedComponentName, ")");
    return (0, _hoistNonReactStatics["default"])(FunctionalWithStyles, WrappedComponent);
  };
}

var _default = withStylesFunctional;
exports["default"] = _default;