import { expect } from 'chai';

import ThemedStyleSheet, { reset } from '../src/ThemedStyleSheet';

describe('ThemedStyleSheet', () => {
  beforeEach(() => {
    reset();
  });

  describe('.get()', () => {
    it('returns undefined when there is no theme', () => {
      expect(ThemedStyleSheet.get()).to.equal(undefined);
      expect(ThemedStyleSheet.get('tropical')).to.equal(undefined);
    });

    it('returns the default theme by default', () => {
      const defaultTheme = { themeName: 'default' };
      ThemedStyleSheet.registerDefaultTheme(defaultTheme);

      expect(ThemedStyleSheet.get()).to.equal(defaultTheme);
    });

    it('returns named themes', () => {
      const defaultTheme = { themeName: 'default' };
      ThemedStyleSheet.registerDefaultTheme(defaultTheme);

      const tropicalTheme = { themeName: 'tropical' };
      ThemedStyleSheet.registerTheme('tropical', tropicalTheme);

      expect(ThemedStyleSheet.get('tropical')).to.eql(tropicalTheme);
    });
  });
});
