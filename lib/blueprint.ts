import {Commit} from './commit';

export interface IBlueprint {
  name: string;
  parseMessage(message: string): Commit;
  filterCommit(commit: Commit): boolean;
  compareCommits(left: Commit, right: Commit): boolean;
}