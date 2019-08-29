"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = useStyles;

var _react = require("react");

var _perf = _interopRequireDefault(require("../utils/perf"));

var _WithStylesContext = _interopRequireWildcard(require("../WithStylesContext"));

var _ThemedStyleSheet = require("../ThemedStyleSheet");

var _detectHooks = _interopRequireDefault(require("./detectHooks"));

/**
 * Hook used to derive the react-with-styles props from the provided react-with-styles
 * theme, interface, direction, and styles function.
 *
 * Note that this implementation does not use caching for stylesFn(theme) results, so only
 * use this if you are not relying on this performance optimization.
 *
 * @export
 * @param {Object} [{ stylesFn, flushBefore }={}]
 * @returns {Object} { css, styles, theme }
 */
function useStyles() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      stylesFn = _ref.stylesFn,
      flushBefore = _ref.flushBefore;

  if (!(0, _detectHooks["default"])()) {
    throw new ReferenceError('useStyles() requires React 16.8 or later');
  } // Get the styles interface and styles theme from context


  var context = (0, _react.useContext)(_WithStylesContext["default"]);
  var stylesInterface = context.stylesInterface,
      theme = context.stylesTheme;
  var direction = context.direction; // Fallback to the singleton implementation

  stylesInterface = stylesInterface || (0, _ThemedStyleSheet._getInterface)();
  theme = theme || (0, _ThemedStyleSheet._getTheme)(); // Flush if specified

  if (flushBefore && stylesInterface.flush) {
    stylesInterface.flush();
  } // Use a cache to store the interface methods and created styles by direction.
  // This way, if the theme and the interface don't change, we do not recalculate
  // styles or any other interface derivations. They are effectively only calculated
  // once per direction, until the theme or interface change.


  var cacheRefLTR = (0, _react.useRef)();
  var cacheRefRTL = (0, _react.useRef)();
  var cacheRef = direction === _WithStylesContext.DIRECTIONS.RTL ? cacheRefRTL : cacheRefLTR; // If the interface and theme haven't changed for this direction,
  // we return all the cached values immediately.

  if (cacheRef.current && stylesInterface && cacheRef.current.stylesInterface === stylesInterface && cacheRef.current.theme === theme) {
    return cacheRef.current;
  } // (Re)Create the styles props for this direction


  var directionSelector = direction === _WithStylesContext.DIRECTIONS.RTL ? 'RTL' : 'LTR'; // Create the themed styles from the interface's create functions
  // with the theme and styles function provided

  var create = stylesInterface["create".concat(directionSelector)] || stylesInterface.create;

  if (process.env.NODE_ENV !== 'production') {
    create = (0, _perf["default"])('create')(create);
  }

  var styles = create(stylesFn ? stylesFn(theme) : {}); // Create the css function from the interface's resolve functions

  var resolve = stylesInterface["resolve".concat(directionSelector)] || stylesInterface.resolve;

  if (process.env.NODE_ENV !== 'production') {
    resolve = (0, _perf["default"])('resolve')(resolve);
  }

  var css = function css() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return resolve(args);
  }; // Cache the withStyles values for this direction


  cacheRef.current = {
    stylesInterface: stylesInterface,
    theme: theme,
    styles: styles,
    css: css
  };
  return cacheRef.current;
}