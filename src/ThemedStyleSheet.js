import deepmerge from 'deepmerge';

let styleInterface;
let styleTheme;

function registerTheme(theme) {
  styleTheme = theme;
}

function registerInterface(interfaceToRegister) {
  styleInterface = interfaceToRegister;
}

function extendStyles(makeFromTheme, extendFromTheme = []) {
  const baseStyle = makeFromTheme(styleTheme);
  const extendedStyles = extendFromTheme.map(extendStyleFn => extendStyleFn(styleTheme));

  return deepmerge.all([baseStyle, ...extendedStyles]);
}

function create(makeFromTheme, createWithDirection, extendFromTheme) {
  const styles = createWithDirection(extendStyles(makeFromTheme, extendFromTheme));

  return () => styles;
}

function createLTR(makeFromTheme, extendFromTheme) {
  return create(makeFromTheme, styleInterface.createLTR || styleInterface.create, extendFromTheme);
}

function createRTL(makeFromTheme, extendFromTheme) {
  return create(makeFromTheme, styleInterface.createRTL || styleInterface.create, extendFromTheme);
}

function get() {
  return styleTheme;
}

function resolve(...styles) {
  if (
    process.env.NODE_ENV !== 'production'
    && typeof performance !== 'undefined'
    && performance.mark !== undefined
  ) {
    performance.mark('react-with-styles.resolve.start');
  }

  const result = styleInterface.resolve(styles);

  if (
    process.env.NODE_ENV !== 'production'
    && typeof performance !== 'undefined'
    && performance.mark !== undefined
  ) {
    performance.mark('react-with-styles.resolve.end');

    performance.measure(
      '\ud83d\udc69\u200d\ud83c\udfa8 [resolve]',
      'react-with-styles.resolve.start',
      'react-with-styles.resolve.end',
    );
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
