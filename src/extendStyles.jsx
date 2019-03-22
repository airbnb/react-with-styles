/* eslint react/forbid-foreign-prop-types: off */

import deepmerge from 'deepmerge';

function validateStyle(style, extendableStyles, currentPath = '') {
  // TODO: Only if DEV
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

export default function extendStyles(
  baseStyleFn,
  extendingStyleFn,
  extendableStyles,
) {
  return (theme) => {
    const baseStyle = baseStyleFn(theme);
    const extendingStyle = extendingStyleFn(theme);

    validateStyle(extendingStyle, extendableStyles);

    const styles = deepmerge(baseStyle, extendingStyle);

    return styles;
  };
}
