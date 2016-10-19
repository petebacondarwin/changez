import {Observable} from 'rxjs';
import {Commit} from './commit';
import {ICommitParser} from './commit-parser';
import {GitRepo} from './util/git';

export class Changelog {
  constructor(public parser: ICommitParser, public repo: GitRepo) {}

  getBranchCommits(branch: string, upto: string) : Observable<Commit> {
    return this.repo.rawCommits({ from: branch, to: upto })
              .map(this.parser.parseMessage)
              .filter(this.parser.filterCommit);
  }

  filterBranch(commit$: Observable<Commit>, exclude$: Observable<Commit>) {
    Observable.combineLatest(commit$, exclude$.toArray(), (commit, excludes) => { return {excludes, commit}; })
      .filter(({excludes, commit}) => excludes.every((exclude) => !this.parser.compareCommits(commit, exclude)))
      .map(({excludes, commit}) => commit);
  }

  getChanges(currentBranch: string, stableBranch: string) {
    const currentFrom$ = this.repo.latestTag({branch: currentBranch});
    const stableFrom$ = this.repo.latestTag({branch: stableBranch});
    const common$ = this.repo.commonAncestor({left: currentBranch, right:  stableBranch});


    const currentCommit$ = currentFrom$.concatMap((currentFrom) => this.getBranchCommits(currentFrom, currentBranch));
    const stableCommit$ = stableFrom$.concatMap((stableFrom) => this.getBranchCommits(stableFrom, stableBranch));

    return this.filterBranch(currentCommit$, stableCommit$);
  }
}