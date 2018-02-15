import globalCache from 'global-cache';

let styleInterface;
let styleTheme;

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

// Using globalCache in order to export a singleton. This file may be imported
// in several places, which otherwise stomps over any registered themes and
// resets to just the defaults.
export default globalCache.setIfMissingThenGet(
  'react-with-styles ThemedStyleSheet',
  () => ({
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
  }),
);
