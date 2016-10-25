export declare class GitRepo {
    pathToRepo: string;
    org: string;
    repo: string;
    constructor(pathToRepo?: string, remote?: string);
    currentBranch(): string;
    rawCommits({debug, format, from, to}: {
        debug?: (value: string) => void;
        format?: string;
        from?: string;
        to?: string;
    }): string[];
    latestTag({branch, debug}: {
        branch: string;
        debug?: (value: string) => void;
    }): string;
    commonAncestor({left, right, debug}: {
        left: string;
        right: string;
        debug?: (value: string) => void;
    }): string;
    private computeRemoteInfo(remote);
    private executeCommand(command, args, debug);
}
