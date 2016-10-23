import {Commit} from './commit';
import {IBlueprint} from './blueprint';
import {GitRepo} from './util/git';

export class Changelog {
  constructor(private parser: IBlueprint, private repo: GitRepo, private log) {}

  // Get a list of commits in the fromBranch that were not cherry-picked from the excludeBranch
  getChanges(fromBranch: string, excludeBranch?: string) {

    const lastTagInFromBranch = this.repo.latestTag({branch: fromBranch});
    const commonCommit = this.repo.commonAncestor({left: fromBranch, right: excludeBranch});

    let changes = this.getCommits(lastTagInFromBranch, fromBranch);
    this.log.info(`Found ${changes.length} commits from "${fromBranch}" since tag "${lastTagInFromBranch}" to include.`);

    if (excludeBranch) {
      const excludeCommits = this.getCommits(commonCommit, excludeBranch);
        this.log.info(`Found ${excludeCommits.length} commits from "${excludeBranch}" to exclude, since "${fromBranch}" split at "${commonCommit}".`);
      changes = this.excludeCommits(changes, excludeCommits);
    }

    const preRevertFilterCount = changes.length;
    changes = this.filterReverts(changes);
    this.log.info(`Removed ${preRevertFilterCount - changes.length} revert related commits.`);

    const preBlueprintFilterCount = changes.length;
    changes = this.filterCommits(changes);
    this.log.info(`Removed ${preBlueprintFilterCount - changes.length} blueprint filtered commits.`);

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
