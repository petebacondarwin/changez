/// <reference types="nunjucks" />
import { Commit, IBlueprint } from '.';
import { Environment } from 'nunjucks';
export declare function setWhitelist(value: string[]): void;
export declare class MockBlueprint implements IBlueprint {
    name: string;
    env: Environment;
    getTemplateFolder(): string;
    getTemplateName(): string;
    parseMessage(message: string): Commit;
    filterCommit(commit: Commit): boolean;
    compareCommits(left: Commit, right: Commit): boolean;
    configureRenderer(env: Environment): void;
}
declare var _default: MockBlueprint;
export default _default;
