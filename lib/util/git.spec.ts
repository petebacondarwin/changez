import {GitRepo} from './git';
import { expect } from 'chai';

describe('GitRepo', () => {
  let repo: GitRepo;

  beforeEach(() => {
    repo = new GitRepo();
  });

  describe('rawCommits()', () => {
    describe('default config', () => {
      it('should return init commit last', (done) => {
        const commit$ = repo.rawCommits({}).last();
        commit$.subscribe(observer(done, (commit) => {
          expect(commit).to.equal('1bd9c1c418ad2a963d7640c7215ac42f9dfc8c30\ninit');
        }));
      });
    });

    describe('with `from` config', () => {
      it('should return commits after the specified commit', (done) => {
        const commit$ = repo.rawCommits({ from: '1bd9c1c418ad2a963d7640c7215ac42f9dfc8c30' }).last();
        commit$.subscribe(observer(done, (commit) => {
          expect(commit).to.equal('5f40c495bbf39e9cdcd2ce7aaaca21fb985b1dba\nbasic git log working');
        }));
      });
    });

    describe('with `to` config', () => {
      it('should return commits up to and including the specified commit', (done) => {
        const commit$ = repo.rawCommits({ to: '5f40c495bbf39e9cdcd2ce7aaaca21fb985b1dba' });
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
        const commit$ = repo.rawCommits({
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

  describe('latestTag', () => {
    it('should return an observable to the most recent tag for the given branch', (done) => {
      repo.latestTag({ branch: 'test-branch' })
        .subscribe(observer(done, (tag: string) => {
          expect(tag).to.equal('v1.0.0');
        }));
    });
  });

  describe('commonAncestor', () => {
    it('should return an observable to the most recent ancestor', (done) => {
      repo.commonAncestor({ left: 'test-branch', right: 'master' })
        .subscribe(observer(done, (commit: string) => {
          expect(commit).to.equal('196ba6cad9dee140079ed48cf48088c86050c28a');
        }));
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