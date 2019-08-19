export function perfStart(startMark) {
  if (
    typeof performance !== 'undefined'
    && performance.mark !== undefined
    && typeof performance.clearMarks === 'function'
    && startMark
  ) {
    performance.clearMarks(startMark);
    performance.mark(startMark);
  }
}

export function perfEnd(startMark, endMark, measureName) {
  if (
    typeof performance !== 'undefined'
    && performance.mark !== undefined
    && typeof performance.clearMarks === 'function'
  ) {
    performance.clearMarks(endMark);
    performance.mark(endMark);
    performance.measure(measureName, startMark, endMark);
    performance.clearMarks(measureName);
  }
}

export default function withPerf(methodName) {
  const startMark = `react-with-styles.${methodName}.start`;
  const endMark = `react-with-styles.${methodName}.end`;
  const measureName = `\ud83d\udc69\u200d\ud83c\udfa8 [${methodName}]`;

  return fn => (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      perfStart(startMark);
    }
    const result = fn(...args);
    if (process.env.NODE_ENV !== 'production') {
      perfEnd(startMark, endMark, measureName);
    }
    return result;
  };
}
