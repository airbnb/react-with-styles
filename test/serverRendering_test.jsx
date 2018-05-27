import React from 'react';
import ReactDOMServer from 'react-dom/server';
import aphroditeInterface from 'react-with-styles-interface-aphrodite';
import { StyleSheetServer } from 'aphrodite';
import { expect } from 'chai';

import ThemedStyleSheet from '../src/ThemedStyleSheet';
import { css, withStyles, withStylesPropTypes } from '../src/withStyles';

describe('server rendering', () => {
  const defaultTheme = {
    color: {
      red: '#990000',
    },
  };

  beforeEach(() => {
    ThemedStyleSheet.registerTheme(defaultTheme);
    ThemedStyleSheet.registerInterface(aphroditeInterface);
  });

  it('does not blow up on the server when using flushBefore', () => {
    function MyComponent({ styles }) {
      return <div {...css(styles.firstDiv)} />;
    }
    MyComponent.propTypes = {
      ...withStylesPropTypes,
    };

    const Container = withStyles(({ color }) => ({
      firstDiv: {
        color: color.red,
      },
    }), { flushBefore: true })(MyComponent);

    expect(() => (
      StyleSheetServer.renderStatic(() => ReactDOMServer.renderToString(<Container />))
    )).to.not.throw();
  });
});
