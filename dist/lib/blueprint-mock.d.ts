import { Commit, IBlueprint } from '.';
export declare function setWhitelist(value: string[]): void;
export declare class AngularBlueprint implements IBlueprint {
    name: string;
    getTemplateFolder(): string;
    getTemplateName(): string;
    parseMessage(message: string): Commit;
    filterCommit(commit: Commit): boolean;
    compareCommits(left: Commit, right: Commit): boolean;
}
declare var _default: AngularBlueprint;
export default _default;
