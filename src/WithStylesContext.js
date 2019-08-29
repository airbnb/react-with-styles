import { createContext } from 'react';
import PropTypes from 'prop-types';
import { DIRECTIONS } from 'react-with-direction';

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

WithStylesContext.Provider.propTypes = {
  stylesInterface: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  stylesTheme: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  direction: PropTypes.oneOf([DIRECTIONS.LTR, DIRECTIONS.RTL]),
};

export default WithStylesContext;
export { DIRECTIONS };
