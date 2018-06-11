import {GitRepo} from './git';
import {expect, use} from 'chai';
import { fake, replace } from 'sinon';
import * as sinonChai from 'sinon-chai';

describe('GitRepo', () => {
  let repo: GitRepo;

  beforeEach(() => {
    use(sinonChai);
    repo = new GitRepo();
  });

  describe('getCurrentBranch()', () => {
    it('should return the current branch name', () => {
      // not a clever test in case we are not on master :-)
      // expect(repo.currentBranch()).to.equal('master');
    });
  });

  describe('rawCommits()', () => {
    describe('default config', () => {
      it('should return init commit last', () => {
        const commit = repo.rawCommits({}).pop();
        expect(commit).to.equal('1bd9c1c418ad2a963d7640c7215ac42f9dfc8c30\ninit');
      });
    });

    describe('with `from` config', () => {
      it('should return commits after the specified commit', () => {
        const commit = repo.rawCommits({ from: '1bd9c1c418ad2a963d7640c7215ac42f9dfc8c30' }).pop();
        expect(commit).to.equal('5f40c495bbf39e9cdcd2ce7aaaca21fb985b1dba\nbasic git log working');
      });
    });

    describe('with `to` config', () => {
      it('should return commits up to and including the specified commit', () => {
        const commits = repo.rawCommits({ to: '5f40c495bbf39e9cdcd2ce7aaaca21fb985b1dba' });
        expect(commits).to.eql([
          '5f40c495bbf39e9cdcd2ce7aaaca21fb985b1dba\nbasic git log working',
          '1bd9c1c418ad2a963d7640c7215ac42f9dfc8c30\ninit'
        ]);
      });
    });

    describe('with `debug` config', () => {
      it('should call the debug function with the git log command', () => {
        let debugOutput: string;
        const commits = repo.rawCommits({
          from: '1bd9c1c418ad2a963d7640c7215ac42f9dfc8c30',
          to: '5f40c495bbf39e9cdcd2ce7aaaca21fb985b1dba',
          debug: (value: string) => { debugOutput = value; }
        });
        expect(debugOutput).to.equal('Your git-log command is:\ngit log --format="%H%n%s%n%b%n------------------------ >8 ------------------------" 1bd9c1c418ad2a963d7640c7215ac42f9dfc8c30..5f40c495bbf39e9cdcd2ce7aaaca21fb985b1dba');
      });
    });
  });

  describe('latestTag', () => {
    it('should return the most recent tag for the given branch', () => {
      const tag = repo.latestTag({ branch: 'test-1' });
      expect(tag).to.equal('test-start-tag');
    });
  });

  describe('commonAncestor', () => {
    it('should return the most recent ancestor', () => {
      const commit = repo.commonAncestor({ left: 'test-branch', right: 'master' });
      expect(commit).to.equal('196ba6cad9dee140079ed48cf48088c86050c28a');
    });
  });

  describe('computeRemoteInfo', () => {
    it('should execute a git remote command', () => {
      const spy = replace(repo, 'executeCommand', fake.returns('https://github.com/angular/angular.js'));
      repo.computeRemoteInfo('origin');
      expect(spy).to.have.been.calledWith('remote', ['get-url', 'origin']);
    });

    it('should extract the org and repo from the remote github path', () => {
      const spy = replace(repo, 'executeCommand', fake.returns('https://github.com/angular/angular.js'));
      repo.computeRemoteInfo('origin');
      expect(repo.org).to.equal('angular');
      expect(repo.repo).to.equal('angular.js');
    });

    it('should remove ".git" from the end of the remote path', () => {
      const spy = replace(repo, 'executeCommand', fake.returns('https://github.com/angular/angular.js.git'));
      repo.computeRemoteInfo('origin');
      expect(repo.org).to.equal('angular');
      expect(repo.repo).to.equal('angular.js');
    });
  });
});
