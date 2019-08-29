"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.withStyles = withStyles;
Object.defineProperty(exports, "withStylesPropTypes", {
  enumerable: true,
  get: function get() {
    return _withStylesPropTypes.withStylesPropTypes;
  }
});
exports.css = exports["default"] = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _react = _interopRequireDefault(require("react"));

var _hoistNonReactStatics = _interopRequireDefault(require("hoist-non-react-statics"));

var _getComponentName = _interopRequireDefault(require("airbnb-prop-types/build/helpers/getComponentName"));

var _emptyStylesFn = _interopRequireDefault(require("./utils/emptyStylesFn"));

var _perf = _interopRequireDefault(require("./utils/perf"));

var _WithStylesContext = _interopRequireWildcard(require("./WithStylesContext"));

var _ThemedStyleSheet = _interopRequireWildcard(require("./ThemedStyleSheet"));

var _withStylesPropTypes = require("./withStylesPropTypes");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

/**
 * A higher order function that returns a higher order class component that injects
 * CSS-in-JS props derived from the react-with-styles theme, interface, and
 * direction provided through the WithStylesContext provider.
 *
 * The function should be used as follows:
 * `withStyles((theme) => styles, options)(Component)`
 *
 * Options can be used to rename the injected props, memoize the component, and flush
 * the styles to the styles tag (or whatever the interface implements as flush) before
 * rendering.
 *
 * @export
 * @param {Function|null|undefined} [stylesFn=EMPTY_STYLES_FN]
 * @param {Object} [{
 *     stylesPropName = 'styles',
 *     themePropName = 'theme',
 *     cssPropName = 'css',
 *     flushBefore = false,
 *     pureComponent = false,
 *   }={}]
 * @returns a higher order component that wraps the provided component and injects
 * the react-with-styles css, styles, and theme props.
 */
function withStyles() {
  var stylesFn = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _emptyStylesFn["default"];

  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$stylesPropName = _ref.stylesPropName,
      stylesPropName = _ref$stylesPropName === void 0 ? 'styles' : _ref$stylesPropName,
      _ref$themePropName = _ref.themePropName,
      themePropName = _ref$themePropName === void 0 ? 'theme' : _ref$themePropName,
      _ref$cssPropName = _ref.cssPropName,
      cssPropName = _ref$cssPropName === void 0 ? 'css' : _ref$cssPropName,
      _ref$flushBefore = _ref.flushBefore,
      flushBefore = _ref$flushBefore === void 0 ? false : _ref$flushBefore,
      _ref$pureComponent = _ref.pureComponent,
      pureComponent = _ref$pureComponent === void 0 ? false : _ref$pureComponent;

  stylesFn = stylesFn || _emptyStylesFn["default"];
  var BaseClass = pureComponent ? _react["default"].PureComponent : _react["default"].Component;
  /** Cache for storing the result of stylesFn(theme) for all themes. */

  var stylesFnResultCacheMap = new Map(); // The function that wraps the provided component in a wrapper
  // component that injects the withStyles props

  return function withStylesHOC(WrappedComponent) {
    var wrappedComponentName = (0, _getComponentName["default"])(WrappedComponent); // The wrapper component that injects the withStyles props

    var WithStyles =
    /*#__PURE__*/
    function (_BaseClass) {
      (0, _inheritsLoose2["default"])(WithStyles, _BaseClass);

      function WithStyles(props, context) {
        var _this;

        _this = _BaseClass.call(this, props, context) || this;
        /** Cache for storing the current props and objects used to derive them */

        _this.cache = {
          rtl: {},
          ltr: {}
        };
        return _this;
      }

      var _proto = WithStyles.prototype;

      _proto.getCache = function getCache(direction) {
        return this.cache[direction];
      };

      _proto.updateCache = function updateCache(direction, results) {
        this.cache[direction] = results;
      };

      _proto.getCurrentInterface = function getCurrentInterface() {
        // Fallback to the singleton implementation
        return this.context && this.context.stylesInterface || (0, _ThemedStyleSheet._getInterface)();
      };

      _proto.getCurrentTheme = function getCurrentTheme() {
        // Fallback to the singleton implementation
        return this.context && this.context.stylesTheme || (0, _ThemedStyleSheet._getTheme)();
      };

      _proto.getCurrentDirection = function getCurrentDirection() {
        return this.context && this.context.direction || _WithStylesContext.DIRECTIONS.LTR;
      };

      _proto.makeCreate = function makeCreate(direction, stylesInterface) {
        var directionSelector = direction === _WithStylesContext.DIRECTIONS.RTL ? 'RTL' : 'LTR';
        var create = stylesInterface["create".concat(directionSelector)] || stylesInterface.create;

        if (process.env.NODE_ENV !== 'production') {
          create = (0, _perf["default"])('create')(create);
        }

        return create;
      };

      _proto.makeResolve = function makeResolve(direction, stylesInterface) {
        var directionSelector = direction === _WithStylesContext.DIRECTIONS.RTL ? 'RTL' : 'LTR';
        var resolve = stylesInterface["resolve".concat(directionSelector)] || stylesInterface.resolve;

        if (process.env.NODE_ENV !== 'production') {
          resolve = (0, _perf["default"])('resolve')(resolve);
        }

        return resolve;
      };

      _proto.stylesFnResult = function stylesFnResult(theme) {
        // Get and store the result in the stylesFnResultsCache for the component
        // -- not the instance -- so we only apply the theme to the stylesFn
        // once per theme for this component.
        var cachedResultForTheme = stylesFnResultCacheMap.get(theme);
        var stylesFnResult = cachedResultForTheme || stylesFn(theme) || {};
        stylesFnResultCacheMap.set(theme, stylesFnResult); // cache the result of stylesFn(theme)

        return stylesFnResult;
      };

      _proto.getProps = function getProps() {
        // Get the styles interface, theme, and direction from context
        var stylesInterface = this.getCurrentInterface();
        var theme = this.getCurrentTheme();
        var direction = this.getCurrentDirection(); // Use a cache to store the interface methods and created styles by direction.
        // This way, if the theme and the interface don't change, we do not recalculate
        // styles or any other interface derivations. They are effectively only calculated
        // once per direction, until the theme or interface change.
        // Assume: always an object.

        var cache = this.getCache(direction); // Determine what's changed

        var interfaceChanged = !cache.stylesInterface || stylesInterface && cache.stylesInterface !== stylesInterface;
        var themeChanged = cache.theme !== theme; // If the interface and theme haven't changed for this direction,
        // we return the cached props immediately.

        if (!interfaceChanged && !themeChanged) {
          return cache.props;
        } // If the theme or the interface changed, then there are some values
        // we need to recalculate. We avoid recalculating the ones we already
        // calculated in the past if the objects they're derived from have not
        // changed.


        var create = interfaceChanged && this.makeCreate(direction, stylesInterface) || cache.create;
        var resolve = interfaceChanged && this.makeResolve(direction, stylesInterface) || cache.resolve; // Derive the css function prop

        var css = interfaceChanged && function () {
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          return resolve(args);
        } || cache.props.css; // Get or calculate the themed styles from the stylesFn:
        // Uses a separate cache at the component level, not at the instance level,
        // to only apply the theme to the stylesFn once per component class per theme.


        var stylesFnResult = this.stylesFnResult(theme); // Derive the styles prop: recalculate it if create changed, or stylesFnResult changed

        var styles = (interfaceChanged || stylesFnResult !== cache.stylesFnResult) && create(stylesFnResult) || cache.props.styles; // Put the new props together

        var props = {
          css: css,
          styles: styles,
          theme: theme
        }; // Update the cache with all the new values

        this.updateCache(direction, {
          stylesInterface: stylesInterface,
          theme: theme,
          create: create,
          resolve: resolve,
          stylesFnResult: stylesFnResult,
          props: props
        });
        return props;
      };

      _proto.flush = function flush() {
        var stylesInterface = this.getCurrentInterface();

        if (stylesInterface && stylesInterface.flush) {
          stylesInterface.flush();
        }
      };

      _proto.render = function render() {
        var _ref2;

        // We only want to re-render if the theme, stylesInterface, or direction change.
        // These values are in context so we're listening for their updates.
        // this.getProps() derives the props from the theme, stylesInterface, and direction in
        // context, and memoizes them on the instance per direction.
        var _this$getProps = this.getProps(),
            theme = _this$getProps.theme,
            styles = _this$getProps.styles,
            css = _this$getProps.css; // Flush if specified


        if (flushBefore) {
          this.flush();
        }

        return _react["default"].createElement(WrappedComponent, (0, _extends2["default"])({}, this.props, (_ref2 = {}, (0, _defineProperty2["default"])(_ref2, themePropName, theme), (0, _defineProperty2["default"])(_ref2, stylesPropName, styles), (0, _defineProperty2["default"])(_ref2, cssPropName, css), _ref2)));
      };

      return WithStyles;
    }(BaseClass); // Copy the wrapped component's prop types and default props on WithStyles


    if (WrappedComponent.propTypes) {
      WithStyles.propTypes = _objectSpread({}, WrappedComponent.propTypes);
      delete WithStyles.propTypes[stylesPropName];
      delete WithStyles.propTypes[themePropName];
      delete WithStyles.propTypes[cssPropName];
    }

    if (WrappedComponent.defaultProps) {
      WithStyles.defaultProps = _objectSpread({}, WrappedComponent.defaultProps);
    }

    WithStyles.contextType = _WithStylesContext["default"];
    WithStyles.WrappedComponent = WrappedComponent;
    WithStyles.displayName = "withStyles(".concat(wrappedComponentName, ")");
    return (0, _hoistNonReactStatics["default"])(WithStyles, WrappedComponent);
  };
}

var _default = withStyles;
/**
* Deprecated: Do not use directly. Please wrap your component in `withStyles` and use the `css`
* prop injected via props instead.
*/

exports["default"] = _default;
var css = _ThemedStyleSheet["default"].resolveLTR;
exports.css = css;