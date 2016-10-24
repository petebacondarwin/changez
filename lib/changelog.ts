import * as nunjucks from 'nunjucks';
import {Commit} from './commit';
import {IBlueprint} from './blueprint';
import {GitRepo} from './util/git';

export class Changelog {
  constructor(private blueprint: IBlueprint, private repo: GitRepo, private log) {
    nunjucks.configure(blueprint.getTemplateFolder(), {});
  }

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

  render(commits: Commit[], version?: string, codename?: string, date?: Date) {
    const types: any = groupBy(commits, 'type');
    Object.keys(types).forEach((type) => {
      types[type] = groupBy(types[type], 'scope');
    });

    const breakingChanges = commits.filter(commit => commit.bcMessage);

    return nunjucks.render(this.blueprint.getTemplateName(), {
      version,
      codename,
      date,
      types,
      commits,
      breakingChanges
    });
  }

  // Get a list of commits between `from` and `to`
  protected getCommits(from: string, to: string): Commit[] {
    return this.repo.rawCommits({ to, from })
      .map(commit => this.blueprint.parseMessage(commit))
      .filter(commit => !!commit);
  }

  // Filter out commits from `commits` that match commits in `excludes`
  protected excludeCommits(commits: Commit[], excludes: Commit[]) {
    return commits.filter(commit => !excludes.some(exclude => {
      const equal = this.blueprint.compareCommits(commit, exclude);
      return equal;
    }));
  }

  // Use the current parser to filter the commit stream
  protected filterCommits(commit: Commit[]) {
    return commit.filter(commit => commit && this.blueprint.filterCommit(commit));
  }

  protected filterReverts(commits: Commit[]): Commit[] {

    const revertsToRemove: { [key: string]: Commit } = {};
    const reverts = commits.filter(commit => commit.isRevert);

    let filteredCommits = commits.filter(commit => {
      const revert = find(reverts, commit, (revert, commit) =>
                        this.blueprint.compareCommits(revert.revertCommit, commit));
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

function groupBy<T>(collection: T[], key: string) {
  const groupObj: { [key: string]: T[]} = {};
  collection.forEach((item) => {
    const group = groupObj[item[key]] || [];
    group.push(item);
    groupObj[item[key]] = group;
  });
  return groupObj;
}
