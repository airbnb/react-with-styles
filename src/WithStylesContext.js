import { createContext } from 'react';

export { DIRECTIONS } from 'react-with-direction';

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
  direction: null,
});

export default WithStylesContext;
