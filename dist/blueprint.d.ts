/// <reference types="nunjucks" />
import { Commit } from './commit';
import { Environment } from 'nunjucks';
export interface IBlueprint {
    name: string;
    getTemplateFolder(): string;
    getTemplateName(): string;
    parseMessage(message: string): Commit;
    filterCommit(commit: Commit): boolean;
    compareCommits(left: Commit, right: Commit): boolean;
    configureRenderer?(env: Environment): any;
}
