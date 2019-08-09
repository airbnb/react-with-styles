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
