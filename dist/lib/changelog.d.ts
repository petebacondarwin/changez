import { Commit } from './commit';
import { IBlueprint } from './blueprint';
import { GitRepo } from './util/git';
export declare class Changelog {
    private blueprint;
    private repo;
    private log;
    constructor(blueprint: IBlueprint, repo: GitRepo, log: any);
    getChanges(fromBranch?: string, excludeBranch?: string): Commit[];
    render(commits: Commit[], version?: string, codename?: string, date?: Date): string;
    protected getCommits(from: string, to: string): Commit[];
    protected excludeCommits(commits: Commit[], excludes: Commit[]): Commit[];
    protected filterCommits(commit: Commit[]): Commit[];
    protected filterReverts(commits: Commit[]): Commit[];
}
