/* eslint react/forbid-foreign-prop-types: off */

import deepmerge from 'deepmerge';

// Recursively iterate through the style object, validating the same path exists in the
// extendableStyles object.
function validateStyle(style, extendableStyles, path = '') {
  if (process.env.NODE_ENV !== 'production') {
    // Stop recursively validating when we hit a style's value and validate the value passes the
    // style's predicate
    if (!style || Array.isArray(style) || typeof style !== 'object') {
      const stylePredicate = extendableStyles;
      if (typeof stylePredicate !== 'function') {
        throw new Error(`withStyles() style predicate should be a function: "${path}". Check the component's "extendableStyles" option.`);
      }

      const isValid = stylePredicate(style);
      if (!isValid) {
        throw new Error(`withStyles() style did not pass the predicate: "${path}": ${style}. Check the component's "extendableStyles" option.`);
      }

      return;
    }

    const styleKeys = Object.keys(style);
    if (styleKeys.length > 0) {
      styleKeys.forEach((styleKey) => {
        const currentPath = `${path}.${styleKey}`;
        const isValid = extendableStyles[styleKey];
        if (!isValid) {
          throw new Error(
            `withStyles() extending style is invalid: "${currentPath}". If this style is expected, add it to the component's "extendableStyles" option.`,
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
