import { createContext } from 'react';

const WithStylesContext = createContext({
  stylesInterface: null,
  stylesTheme: null,
});

export default WithStylesContext;
