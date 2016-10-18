import {rawCommits} from './raw-commits';
import { expect } from 'chai';

describe('rawCommits()', () => {
  describe('default config', () => {
    it('should return init commit last', (done) => {
      const commit$ = rawCommits({}).last();
      commit$.subscribe(observer(done, (commit) => {
        expect(commit).to.equal('1bd9c1c418ad2a963d7640c7215ac42f9dfc8c30\ninit');
      }));
    });
  });

  describe('with `from` config', () => {
    it('should return commits after the specified commit', (done) => {
      const commit$ = rawCommits({ from: '1bd9c1c418ad2a963d7640c7215ac42f9dfc8c30' }).last();
      commit$.subscribe(observer(done, (commit) => {
        expect(commit).to.equal('5f40c495bbf39e9cdcd2ce7aaaca21fb985b1dba\nbasic git log working');
      }));
    });
  });

  describe('with `to` config', () => {
    it('should return commits up to and including the specified commit', (done) => {
      const commit$ = rawCommits({ to: '5f40c495bbf39e9cdcd2ce7aaaca21fb985b1dba' });
      commit$.toArray().subscribe(observer(done, (commit) => {
        expect(commit).to.eql([
          '5f40c495bbf39e9cdcd2ce7aaaca21fb985b1dba\nbasic git log working',
          '1bd9c1c418ad2a963d7640c7215ac42f9dfc8c30\ninit'
        ]);
      }));
    });
  });

  describe('with `debug` config', () => {
    it('should call the debug function with the git log command', (done) => {
      let output: string;
      const commit$ = rawCommits({
        from: '1bd9c1c418ad2a963d7640c7215ac42f9dfc8c30',
        to: '5f40c495bbf39e9cdcd2ce7aaaca21fb985b1dba',
        debug: (value: string) => { output = value }
       });
      commit$.toArray().subscribe(() => {
        expect(output).to.equal('Your git-log command is:\ngit log --format=%H%n%s%n%b%n------------------------ >8 ------------------------ 1bd9c1c418ad2a963d7640c7215ac42f9dfc8c30..5f40c495bbf39e9cdcd2ce7aaaca21fb985b1dba');
        done();
      });
    });
  });
});


function observer(done, checkFn) {
  return {
    next: checkFn,
    error: (err) => { throw new Error(err); },
    complete: done
  };
}