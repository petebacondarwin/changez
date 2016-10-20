import {Commit} from './commit';
import {ICommitParser} from './commit-parser';
import {GitRepo} from './util/git';

export class Changelog {
  constructor(public parser: ICommitParser, public repo: GitRepo) {}

  // Return a list of commits between `from` and `to`
  getCommits(from: string, to: string): Commit[] {
    return this.repo.rawCommits({ to, from })
      .map(commit => this.parser.parseMessage(commit))
      .filter(commit => !!commit);
  }

  // Use the current parser to filter the commit stream
  filterCommits(commit: Commit[]) {
    return commit.filter(commit => commit && this.parser.filterCommit(commit));
  }

  // Filter out commits from `commits` that match commits in `excludes`
  excludeCommits(commits: Commit[], excludes: Commit[]) {
    return commits.filter(commit => !excludes.some(exclude => this.parser.compareCommits(commit, exclude)));
  }

  // Return a stream of commits that are in the currentBranch but not in the stableBranch
  getChanges(currentBranch: string, stableBranch: string) {

    const latestTag = this.repo.latestTag({branch: currentBranch});
    const currentCommits = this.getCommits(latestTag, currentBranch);

    const commonCommit = this.repo.commonAncestor({left: currentBranch, right: stableBranch});
    const stableCommits = this.getCommits(commonCommit, stableBranch);

    console.log(latestTag, commonCommit);
    console.log(currentCommits);
    console.log(stableCommits);

    return this.excludeCommits(currentCommits, stableCommits);
  }

  filterReverts(commits: Commit[]): Commit[] {
    // this is horribly inefficient :-P
    const reverts = commits.filter(commit => commit.isRevert);
    return commits.filter(commit =>
      // filter out if this is a commit that was reverted
      !reverts.some(revert => this.parser.compareCommits(commit, revert.revertCommit))
      &&
      // filter out if this is a revert commit that matches a commit to be reverted
      !(commit.isRevert && commits.some(commit2 => this.parser.compareCommits(commit2, commit.revertCommit)))
    );
  }
}