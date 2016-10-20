import {expect} from 'chai';
import {Changelog} from './changelog';
import {GitRepo} from './util/git';
import {ICommitParser} from './commit-parser';
import {AngularCommitParser} from './angularjs/angular-commit-parser';

describe('Changelog', () => {
  let parser: ICommitParser;
  let repo: GitRepo;
  let changelog: Changelog;

  beforeEach(() => {
    parser = new AngularCommitParser();
    repo = new GitRepo();
    changelog = new Changelog(parser, repo);
  });

  describe('getBranchCommits()', () => {
    it('should parse and filter the raw commits', () => {
      const commits = changelog.getCommits('test-1', 'diverge-point')
        .map(commit => commit.toString())
      expect(commits).to.eql([
        'revert:feat(B): title B',
        'feat(E): title E',
        'perf(D): title D',
        'feat(B): title B'
      ]);
    });
  });

  describe('filterBranch()', () => {

  });

  describe('getChanges()', () => {
    it('should filter commits that are in both branches', () => {
      const commits = changelog.getChanges('test-1', 'test-2')
          .map(commit => commit.toString())

      console.log(commits);
      expect(commits).to.eql([
        'feat(B): title B',
        'feat(E): title E',
        'perf(D): title D', // this line is in the "stable" branch so it should be filtered out
        'revert:feat(B): title B'
      ]);
    });
  });
});