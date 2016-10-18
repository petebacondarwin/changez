import {Commit} from './commit';

export interface ICommitParser {
  parseMessage(string) : Commit;
  filterCommit(commit: Commit): boolean;
  compareCommits(left: Commit, right: Commit) : boolean;
}