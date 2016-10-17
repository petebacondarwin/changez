import {commitStream} from '../lib/commit-stream';
import { expect } from 'chai';

describe('commitStream', () => {
  it('should return an observable of commits', (done) => {
    const commit$ = commitStream({});
    commit$.subscribe((commit) => {
      console.log('COMMIT:', commit);
      expect()
    },
    (err) => { throw new Error(err); },
    () => done())
  });
});