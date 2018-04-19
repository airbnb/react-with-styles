let styleInterface;
let styleTheme;
let styleTransform;

function registerTheme(theme) {
  styleTheme = theme;
}

function registerInterface(interfaceToRegister) {
  styleInterface = interfaceToRegister;
}

function create(makeFromTheme, createWithDirection) {
  const styles = createWithDirection(styleTransform
    ? styleTransform(styleTheme, makeFromTheme(styleTheme))
    : makeFromTheme(styleTheme));

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
  return styleInterface.resolve(styles);
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

function registerStyleTransform(transform) {
  styleTransform = transform;
}

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
  registerStyleTransform,
};
