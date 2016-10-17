import {commitStream} from '../lib/commit-stream';
import { expect } from 'chai';

describe('commitStream()', () => {
  describe('default config', () => {
    it('should return init commit first', (done) => {
      const commit$ = commitStream({}).take(1);
      commit$.subscribe((commit) => {
        expect(commit).to.equal('init');
      },
      (err) => { throw new Error(err); },
      () => done())
    });
  });
});