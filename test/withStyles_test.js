import { expect } from 'chai';
import sinon from 'sinon-sandbox';
import React from 'react';

import * as withStylesWithHooks from '../src/withStylesWithHooks';
import * as withStylesWithThemedStyleSheet from '../src/withStylesWithThemedStyleSheet';
import { withStyles } from '../src/withStyles';

const REACT_16_8_FUNCTIONS = ['useContext', 'useEffect', 'useState', 'memo', 'useRef'];
const NOOP = () => {};

describe('withStyles()', () => {
  let withStylesWithHooksSpy;
  let withStylesWithThemedStyleSheetSpy;

  function replaceReactFunctions(functionNames, value) {
    if (!functionNames) return null;
    const replacedFunctions = {};
    functionNames.forEach((functionName) => {
      replacedFunctions[functionName] = React[functionName];
      React[functionName] = value;
    });
    return replacedFunctions;
  }

  function restoreReactFunctions(reactFunctionsToRestore) {
    if (!reactFunctionsToRestore) return;
    Object.keys(reactFunctionsToRestore).forEach((functionName) => {
      React[functionName] = reactFunctionsToRestore[functionName];
    });
  }

  beforeEach(() => {
    withStylesWithHooksSpy = sinon.spy(withStylesWithHooks, 'withStylesWithHooks');
    withStylesWithThemedStyleSheetSpy = sinon.spy(
      withStylesWithThemedStyleSheet,
      'withStylesWithThemedStyleSheet',
    );
  });
  afterEach(() => {
    sinon.restore();
  });

  describe('hooks are available', () => {
    // Set React functions to NOOPs if the current version of react doesn't support them
    // so we can still run the tests for when they're available
    let reactFunctionsToRestore;
    beforeEach(() => {
      reactFunctionsToRestore = replaceReactFunctions(REACT_16_8_FUNCTIONS, NOOP);
    });
    afterEach(() => {
      restoreReactFunctions(reactFunctionsToRestore);
    });
    it('calls withStylesWithHooks', () => {
      expect(withStylesWithHooksSpy).to.have.property('callCount', 0);
      expect(withStylesWithThemedStyleSheetSpy).to.have.property('callCount', 0);
      withStyles();
      expect(withStylesWithHooksSpy).to.have.property('callCount', 1);
      expect(withStylesWithThemedStyleSheetSpy).to.have.property('callCount', 0);
    });
  });

  describe('hooks are not available', () => {
    // Set React functions as undefined if the current version of react supports them
    // so we can still run the tests for when they're not available
    let reactFunctionsToRestore;
    beforeEach(() => {
      reactFunctionsToRestore = replaceReactFunctions(REACT_16_8_FUNCTIONS, undefined);
    });
    afterEach(() => {
      restoreReactFunctions(reactFunctionsToRestore);
    });
    it('calls withStylesWithThemedStyleSheet', () => {
      expect(withStylesWithHooksSpy).to.have.property('callCount', 0);
      expect(withStylesWithThemedStyleSheetSpy).to.have.property('callCount', 0);
      withStyles();
      expect(withStylesWithHooksSpy).to.have.property('callCount', 0);
      expect(withStylesWithThemedStyleSheetSpy).to.have.property('callCount', 1);
    });
  });
});
