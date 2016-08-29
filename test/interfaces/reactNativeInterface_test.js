import { expect } from 'chai';

import reactNativeInterface from '../../src/interfaces/reactNativeInterface';

describe('reactNativeInterface', () => {
  describe('.create()', () => {
    it('processes the styles', () => {
      expect(reactNativeInterface.create({
        foo: {
          color: 'red',
        },
      })).to.eql({
        foo: 0,
      });
    });
  });

  describe('.resolve()', () => {
    it('returns processed styles', () => {
      const styles = reactNativeInterface.create({
        foo: {
          color: 'red',
        },
      });

      expect(reactNativeInterface.resolve([styles.foo]))
        .to.eql({ style: [styles.foo] });
    });

    it('returns multiple processed styles', () => {
      const styles = reactNativeInterface.create({
        foo: {
          color: 'red',
        },

        bar: {
          display: 'inline-block',
        },
      });

      expect(reactNativeInterface.resolve([styles.foo, styles.bar]))
        .to.eql({ style: [styles.foo, styles.bar] });
    });

    it('handles an object with inline styles', () => {
      const style = {
        color: 'red',
      };

      expect(reactNativeInterface.resolve([style]))
        .to.eql({
          style: [{
            color: 'red',
          }],
        });
    });

    it('handles multiple objects with inline styles', () => {
      const styleA = {
        color: 'red',
      };

      const styleB = {
        display: 'inline-block',
      };

      expect(reactNativeInterface.resolve([styleA, styleB]))
        .to.eql({
          style: [
            { color: 'red' },
            { display: 'inline-block' },
          ],
        });
    });

    it('handles a mix of processed and inline styles', () => {
      const styles = reactNativeInterface.create({
        foo: {
          color: 'red',
        },
      });

      const style = {
        display: 'inline-block',
      };

      expect(reactNativeInterface.resolve([styles.foo, style]))
        .to.eql({
          style: [
            styles.foo,
            { display: 'inline-block' },
          ],
        });
    });

    it('handles nested arrays', () => {
      const styles = reactNativeInterface.create({
        foo: {
          color: 'red',
        },
      });

      const styleA = {
        display: 'inline-block',
      };

      const styleB = {
        padding: 1,
      };

      expect(reactNativeInterface.resolve([[styles.foo], [[styleA, styleB]]]))
        .to.eql({
          style: [
            [styles.foo],
            [[
              { display: 'inline-block' },
              { padding: 1 },
            ]],
          ],
        });
    });
  });
});
