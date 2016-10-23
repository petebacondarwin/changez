import {Commit} from './commit';

export interface IBlueprint {
  name: string;
  getTemplateFolder(): string;
  getTemplateName(): string;
  parseMessage(message: string): Commit;
  filterCommit(commit: Commit): boolean;
  compareCommits(left: Commit, right: Commit): boolean;
}