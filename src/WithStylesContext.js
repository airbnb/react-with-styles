import { createContext } from 'react';

function detectAndCreateContext(defaultValue) {
  if (createContext) {
    return createContext(defaultValue);
  }

  return {
    Provider: () => {
      throw new ReferenceError('WithStylesContext requires React 16.3 or later');
    },
    Consumer: () => {
      throw new ReferenceError('WithStylesContext requires React 16.3 or later');
    },
  };
}

const WithStylesContext = detectAndCreateContext({
  stylesInterface: null,
  stylesTheme: null,
});

export default WithStylesContext;
