import { expect } from 'chai';
import flatten from '../../src/util/flatten';

describe('flatten()', () => {
  it('does nothing to an array that is already flat', () => {
    expect(flatten([1, 2, 3])).to.eql([1, 2, 3]);
  });

  it('flattens one level', () => {
    expect(flatten([1, [2, 3]])).to.eql([1, 2, 3]);
  });

  it('flattens two levels', () => {
    expect(flatten([1, [2, [3]]])).to.eql([1, 2, 3]);
  });

  it('preserves ordering', () => {
    expect(flatten([1, [2, [3], 4], 5])).to.eql([1, 2, 3, 4, 5]);
  });
});
