import {Commit} from './commit';
import {ICommitParser} from './commit-parser';
import {GitRepo} from './util/git';

export class Changelog {
  constructor(public parser: ICommitParser, public repo: GitRepo) {}

  // Get a list of commits in the fromBranch that were not cherry-picked from the excludeBranch
  getChanges(fromBranch: string, excludeBranch: string) {

    const lastTagInFromBranch = this.repo.latestTag({branch: fromBranch});
    const commonCommit = this.repo.commonAncestor({left: fromBranch, right: excludeBranch});
    const excludeCommits = this.getCommits(commonCommit, excludeBranch);

    let changes = this.getCommits(lastTagInFromBranch, fromBranch);
    changes = this.excludeCommits(changes, excludeCommits);
    changes = this.filterReverts(changes);
    changes = this.filterCommits(changes);
    return changes;
  }

  // Get a list of commits between `from` and `to`
  getCommits(from: string, to: string): Commit[] {
    return this.repo.rawCommits({ to, from })
      .map(commit => this.parser.parseMessage(commit))
      .filter(commit => !!commit);
  }

  // Filter out commits from `commits` that match commits in `excludes`
  excludeCommits(commits: Commit[], excludes: Commit[]) {
    return commits.filter(commit => !excludes.some(exclude => {
      const equal = this.parser.compareCommits(commit, exclude);
      return equal;
    }));
  }

  // Use the current parser to filter the commit stream
  filterCommits(commit: Commit[]) {
    return commit.filter(commit => commit && this.parser.filterCommit(commit));
  }

  filterReverts(commits: Commit[]): Commit[] {

    const revertsToRemove: { [key: string]: Commit } = {};
    const reverts = commits.filter(commit => commit.isRevert);

    let filteredCommits = commits.filter(commit => {
      const revert = find(reverts, commit, (revert, commit) =>
                        this.parser.compareCommits(revert.revertCommit, commit));
      if (revert) revertsToRemove[revert.hash] = revert;
      return !revert;
    });

    filteredCommits = filteredCommits.filter(commit => !revertsToRemove[commit.hash]);
    return filteredCommits;
  }
}

function find<T>(haystack: T[], needle: T, isEqual: (a: T, b: T) => boolean) {
  for (let i = 0; i < haystack.length; ++i) {
    if (isEqual(haystack[i], needle)) {
      return haystack[i];
    }
  }
}
