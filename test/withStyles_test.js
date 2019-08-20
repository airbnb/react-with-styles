import { expect } from 'chai';
import sinon from 'sinon-sandbox';

import * as detectHooks from '../src/utils/detectHooks';
import * as withStylesWithHooks from '../src/withStylesWithHooks';
import * as withStylesWithThemedStyleSheet from '../src/withStylesWithThemedStyleSheet';
import { withStyles } from '../src/withStyles';

describe('withStyles()', () => {
  let withStylesWithHooksSpy;
  let withStylesWithThemedStyleSheetSpy;

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

  describe('hooks are available (react >= 16.8)', () => {
    beforeEach(() => {
      sinon.stub(detectHooks, 'default').returns(true);
    });

    it('calls withStylesWithHooks', () => {
      expect(withStylesWithHooksSpy.callCount).to.equal(0);
      expect(withStylesWithThemedStyleSheetSpy.callCount).to.equal(0);
      withStyles();
      expect(withStylesWithHooksSpy.callCount).to.equal(1);
      expect(withStylesWithThemedStyleSheetSpy.callCount).to.equal(0);
    });
  });

  describe('hooks are not available (react < 16.8)', () => {
    beforeEach(() => {
      sinon.stub(detectHooks, 'default').returns(false);
    });

    it('calls withStylesWithThemedStyleSheet', () => {
      expect(withStylesWithHooksSpy.callCount).to.equal(0);
      expect(withStylesWithThemedStyleSheetSpy.callCount).to.equal(0);
      withStyles();
      expect(withStylesWithHooksSpy.callCount).to.equal(0);
      expect(withStylesWithThemedStyleSheetSpy.callCount).to.equal(1);
    });
  });
});
