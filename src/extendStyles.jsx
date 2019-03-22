/* eslint react/forbid-foreign-prop-types: off */

import deepmerge from 'deepmerge';

// Recursively iterate through the style object, validating the same path exists in the
// extendableStyles object.
function validateStyle(style, extendableStyles, path = '') {
  if (process.env.NODE_ENV !== 'production') {
    // Stop recursively validating when we hit a style's value
    if (typeof style === 'string' || typeof style === 'number') {
      return;
    }

    const styleKeys = Object.keys(style);
    if (styleKeys.length) {
      styleKeys.forEach((styleKey) => {
        const currentPath = `${path}.${styleKey}`;
        const isValid = extendableStyles[styleKey];
        if (!isValid) {
          throw new Error(
            `withStyles() extending style is invalid: ${currentPath}. If this style is expected, add it to`
            + 'the component\'s "extendableStyles" option.',
          );
        }
        validateStyle(style[styleKey], extendableStyles[styleKey], currentPath);
      });
    }
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
