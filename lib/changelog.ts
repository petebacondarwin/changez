import {Observable} from 'rxjs';
import {Commit} from './commit';
import {ICommitParser} from './commit-parser';
import {rawCommits} from './util/raw-commits';

class Changelog {
  constructor(public parser: ICommitParser) {}

  getBranchCommits(branch: string, upto: string) : Observable<Commit> {
    return rawCommits({ from: branch, to: upto })
              .map(this.parser.parseMessage)
              .filter(this.parser.filterCommit);
  }

  filterBranch(commit$: Observable<Commit>, exclude$: Observable<Commit>) {
    Observable.combineLatest(commit$, exclude$.toArray(), (commit, excludes) => { return {excludes, commit}; })
      .filter(({excludes, commit}) => excludes.every((exclude) => !this.parser.compareCommits(commit, exclude)))
      .map(({excludes, commit}) => commit);
  }
}