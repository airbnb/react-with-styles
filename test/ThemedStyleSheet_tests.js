import { expect } from 'chai';
import globalCache from 'global-cache';

let ThemedStyleSheet;

describe('ThemedStyleSheet', () => {
  beforeEach(() => {
    ThemedStyleSheet = require('../src/ThemedStyleSheet').default; // eslint-disable-line global-require
  });

  afterEach(() => {
    delete require.cache[require.resolve('../src/ThemedStyleSheet')];
    globalCache.clear();
  });

  describe('errors', () => {
    it('throws a Reference Error if a theme has not been registered and create is called', () => {
      ThemedStyleSheet.registerInterface({
        create() {},
        resolve() {},
      });
      expect(ThemedStyleSheet.create).to.throw(ReferenceError);
    });

    describe('Style Interface', () => {
      beforeEach(() => {
        ThemedStyleSheet.registerTheme({});
      });

      it('throws a ReferenceError if an interface has not be registered and create is called', () => {
        expect(ThemedStyleSheet.create).to.throw(ReferenceError);
      });

      it('throws a ReferenceError if an interface has not be registered and resolve is called', () => {
        expect(ThemedStyleSheet.resolve).to.throw(ReferenceError);
      });

      it('throws a TypeError if create is not a function when the interface is registered', () => {
        const mockInterface = {
          create: {},
          resolve() {},
        };
        const register = () => ThemedStyleSheet.registerInterface(mockInterface);
        expect(register).to.throw(TypeError);
      });

      it('throws a TypeError if resolve is not a function when the interface is registered', () => {
        const mockInterface = {
          create() {},
          resolve: {},
        };
        const register = () => ThemedStyleSheet.registerInterface(mockInterface);
        expect(register).to.throw(TypeError);
      });
    });
  });
});
