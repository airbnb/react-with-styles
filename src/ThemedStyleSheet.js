import globalCache from 'global-cache';

let styleInterface;
let styleTheme;
const makeFromThemes = {};
let internalId = 0;

function registerTheme(theme) {
  styleTheme = {
    theme,
    styles: {},
  };
}

function registerInterface(interfaceToRegister) {
  styleInterface = interfaceToRegister;
}

function create(makeFromTheme) {
  // Get an id to associate with this stylesheet
  const id = internalId;
  internalId += 1;

  const { theme, styles } = styleTheme;
  styles[id] = styleInterface.create(makeFromTheme(theme));

  makeFromThemes[id] = makeFromTheme;

  return () => styleTheme.styles[id];
}

function get() {
  return styleTheme.theme;
}

function resolve(...styles) {
  return styleInterface.resolve(styles);
}

function resolveNoRTL(...styles) {
  if (styleInterface.resolveNoRTL) {
    return styleInterface.resolveNoRTL(styles);
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
    create,
    get,
    resolveNoRTL,
    resolve,
    flush,
  }),
);
