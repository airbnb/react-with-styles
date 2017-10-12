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

function invalidMethodError(invalidMethodName) {
  return new TypeError(`
    react-with-styles internal error: An invalid Style Interface has been registered.
    typeof interface.${invalidMethodName} must be a function.
  `);
}

function validateStyleInterfaceShape(interfaceToValidate) {
  if (!(typeof interfaceToValidate.create === 'function')) {
    throw invalidMethodError('create');
  }

  if (!(typeof interfaceToValidate.resolve === 'function')) {
    throw invalidMethodError('resolve');
  }
}

function registerInterface(interfaceToRegister) {
  if (process.env.NODE_ENV !== 'production') {
    validateStyleInterfaceShape(interfaceToRegister);
  }
  styleInterface = interfaceToRegister;
}

function validateStyleInterface() {
  if (!styleInterface) {
    throw new ReferenceError(`
      react-with-styles internal error: A Style Interface has not been registered.
      You must register a valid Style Interface using ThemedStyleSheet.registerInterface.
    `);
  }
}

function validateStyleTheme() {
  if (!styleTheme) {
    throw new ReferenceError(`
      react-with-styles internal error: A Theme has not been registered.
      You must register a theme using ThemedStyleSheet.registerTheme.
    `);
  }
}

function create(makeFromTheme) {
  if (process.env.NODE_ENV !== 'production') {
    validateStyleInterface();
    validateStyleTheme();
  }
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
  if (process.env.NODE_ENV !== 'production') {
    validateStyleInterface();
  }
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
