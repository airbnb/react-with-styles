"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.perfStart = perfStart;
exports.perfEnd = perfEnd;
exports["default"] = withPerf;

function perfStart(startMark) {
  if (typeof performance !== 'undefined' && performance.mark !== undefined && typeof performance.clearMarks === 'function' && startMark) {
    performance.clearMarks(startMark);
    performance.mark(startMark);
  }
}

function perfEnd(startMark, endMark, measureName) {
  if (typeof performance !== 'undefined' && performance.mark !== undefined && typeof performance.clearMarks === 'function') {
    performance.clearMarks(endMark);
    performance.mark(endMark);
    performance.measure(measureName, startMark, endMark);
    performance.clearMarks(measureName);
  }
}

function withPerf(methodName) {
  var startMark = "react-with-styles.".concat(methodName, ".start");
  var endMark = "react-with-styles.".concat(methodName, ".end");
  var measureName = "\uD83D\uDC69\u200D\uD83C\uDFA8 [".concat(methodName, "]");
  return function (fn) {
    return function () {
      if (process.env.NODE_ENV !== 'production') {
        perfStart(startMark);
      }

      var result = fn.apply(void 0, arguments);

      if (process.env.NODE_ENV !== 'production') {
        perfEnd(startMark, endMark, measureName);
      }

      return result;
    };
  };
}