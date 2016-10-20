import {expect} from 'chai';
import {Observable} from 'rxjs';
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
      changelog.getBranchCommits('test-1', 'test-2');
    });
  });

  describe('filterBranch()', () => {

  });

  describe('getChanges()', () => {

  });
});