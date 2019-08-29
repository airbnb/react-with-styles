"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = detectHooks;

var _react = require("react");

function detectHooks() {
  return _react.useContext && _react.useRef;
}