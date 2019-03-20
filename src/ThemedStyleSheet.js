import deepmerge from 'deepmerge';

let styleInterface;
let styleTheme;

function registerTheme(theme) {
  styleTheme = theme;
}

function registerInterface(interfaceToRegister) {
  styleInterface = interfaceToRegister;
}

function validateStyle(style, extendableStyles, currentPath = '') {
  if (style === null || Array.isArray(style) || typeof style !== 'object') {
    return;
  }

  const styleKeys = Object.keys(style);
  if (styleKeys.length) {
    styleKeys.forEach((styleKey) => {
      const path = `${currentPath}.${styleKey}`;
      const isValid = extendableStyles[styleKey];
      if (!isValid) {
        throw new Error(
          `withStyles() extending style is invalid: ${path}. If this style is expected, add it to`
          + 'the component\'s "extendableStyles" option.',
        );
      }
      validateStyle(style[styleKey], extendableStyles[styleKey], path);
    });
  }
}

function validateAndMergeStyles(makeFromTheme, extendFromTheme = [], extendableStyles) {
  const baseStyle = makeFromTheme(styleTheme);
  const extendedStyles = extendFromTheme.map((extendStyleFn) => {
    const style = extendStyleFn(styleTheme);

    if (process.env.NODE_ENV !== 'production') {
      validateStyle(style, extendableStyles);
    }

    return style;
  });

  return deepmerge.all([baseStyle, ...extendedStyles]);
}

function create(makeFromTheme, createWithDirection, extendFromTheme, extendableStyles) {
  const styles = createWithDirection(validateAndMergeStyles(
    makeFromTheme,
    extendFromTheme,
    extendableStyles,
  ));

  return () => styles;
}

function createLTR(makeFromTheme, extendFromTheme, extendableStyles) {
  return create(
    makeFromTheme,
    styleInterface.createLTR || styleInterface.create,
    extendFromTheme,
    extendableStyles,
  );
}

function createRTL(makeFromTheme, extendFromTheme, extendableStyles) {
  return create(
    makeFromTheme,
    styleInterface.createRTL || styleInterface.create,
    extendFromTheme,
    extendableStyles,
  );
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
