export default function () {
  return (
    process.env.NODE_ENV !== 'production'
    && typeof performance !== 'undefined'
    && performance.mark !== undefined
    && typeof performance.clearMarks === 'function'
  );
}
