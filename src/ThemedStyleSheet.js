let styleInterface;
let styleTheme;

const START_MARK = 'react-with-styles.resolve.start';
const END_MARK = 'react-with-styles.resolve.end';
const MEASURE_MARK = '\ud83d\udc69\u200d\ud83c\udfa8 [resolve]';

function registerTheme(theme) {
  styleTheme = theme;
}

function registerInterface(interfaceToRegister) {
  styleInterface = interfaceToRegister;
}

function create(makeFromTheme, createWithDirection) {
  const styles = createWithDirection(makeFromTheme(styleTheme));
  return () => styles;
}

function createLTR(makeFromTheme) {
  return create(makeFromTheme, styleInterface.createLTR || styleInterface.create);
}

function createRTL(makeFromTheme) {
  return create(makeFromTheme, styleInterface.createRTL || styleInterface.create);
}

function get() {
  return styleTheme;
}

function resolve(...styles) {
  if (
    process.env.NODE_ENV !== 'production'
    && typeof performance !== 'undefined'
    && performance.mark !== undefined && typeof performance.clearMarks === 'function'
  ) {
    performance.clearMarks(START_MARK);
    performance.mark(START_MARK);
  }

  const result = styleInterface.resolve(styles);

  if (
    process.env.NODE_ENV !== 'production'
    && typeof performance !== 'undefined'
    && performance.mark !== undefined && typeof performance.clearMarks === 'function'
  ) {
    performance.clearMarks(END_MARK);
    performance.mark(END_MARK);

    performance.measure(
      MEASURE_MARK,
      START_MARK,
      END_MARK,
    );
    performance.clearMarks(MEASURE_MARK);
  }

  return result;
}

function resolveLTR(...styles) {
  if (styleInterface.resolveLTR) {
    return styleInterface.resolveLTR(styles);
  }

  return resolve(styles);
}

function resolveRTL(...styles) {
  if (styleInterface.resolveRTL) {
    return styleInterface.resolveRTL(styles);
  }

  return resolve(styles);
}

function flush() {
  if (styleInterface.flush) {
    styleInterface.flush();
  }
}

// Exported until we deprecate this API completely
// eslint-disable-next-line no-underscore-dangle
export function _getInterface() {
  return styleInterface;
}

// Exported until we deprecate this API completely
export { get as _getTheme };

export default {
  registerTheme,
  registerInterface,
  create: createLTR,
  createLTR,
  createRTL,
  get,
  resolve: resolveLTR,
  resolveLTR,
  resolveRTL,
  flush,
};
