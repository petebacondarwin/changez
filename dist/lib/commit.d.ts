export declare class Commit {
    raw: string;
    hash: string;
    isRevert: boolean;
    revertCommit: Commit;
    type: string;
    scope: string;
    title: string;
    body: string;
    bcMessage: string;
    closes: string[];
    constructor(raw?: string);
    toString(): string;
}
