import { createContext } from 'react';

function detectAndCreateContext(defaultValue) {
  if (createContext) {
    return createContext(defaultValue);
  }

  return {
    Provider: () => {
      throw new ReferenceError('WithStylesContext requires React 16.6 or later');
    },
    Consumer: () => {
      throw new ReferenceError('WithStylesContext requires React 16.6 or later');
    },
  };
}

const WithStylesContext = detectAndCreateContext({
  stylesInterface: null,
  stylesTheme: null,
});

export default WithStylesContext;
