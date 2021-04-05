"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitRepo = void 0;
const path_1 = require("path");
const shelljs_1 = require("shelljs");
const SPLIT_MARKER = '------------------------ >8 ------------------------';
/**
 * A helper class that represents a Git repository.
 */
class GitRepo {
    /**
     * Create a new instance of this class
     * @param pathToRepo a path to the local git repository;
     *                   can be relative to the current working directory;
     *                   defaults to `'.'`.
     * @param remote the git remote to use when computing the github `org` and `repo`;
     *               defaults to `'origin'`.
     */
    constructor(pathToRepo = '.', remote = 'origin') {
        this.pathToRepo = path_1.resolve(pathToRepo);
        this.computeRemoteInfo(remote);
    }
    /**
     * Get the name of the current git branch
     */
    currentBranch() {
        return this.executeCommand('symbolic-ref', ['--short HEAD'], undefined);
    }
    /**
     * Get a list of commit message between two commits
     * @param options - a hash of options
     *  * `debug`: a function to call with debug info
     *  * `format`: how to format the commit message; default "hash-subject-body"
     *  * `from`: the commit from which to start the list of commits
     *  * `to`: the commit to which to end the list of commits, defaults to `'HEAD'`
     *
     */
    rawCommits({ debug, format = '%H%n%s%n%b', from = '', to = 'HEAD' }) {
        const gitFormat = `--format="${format}%n${SPLIT_MARKER}"`;
        const gitFromTo = from ? `${from}..${to}` : to;
        return this.executeCommand('log', [gitFormat, gitFromTo], debug)
            .split(SPLIT_MARKER)
            .map((item) => item.trim())
            .filter((item) => !!item);
    }
    /**
     * Get the most recent tag on the given branch; defaults to the current branch
     */
    latestTag({ branch = '', debug }) {
        return this.executeCommand('describe', ['--tags', '--abbrev=0', branch], debug);
    }
    /**
     * Get the most recent commit that is an ancestor of both the `left` and `right` branches.
     */
    commonAncestor({ left, right, debug }) {
        return this.executeCommand('merge-base', [left, right], debug);
    }
    computeRemoteInfo(remote) {
        const remoteUrlParts = this.executeCommand('remote', ['get-url', remote], undefined).split('/');
        this.repo = remoteUrlParts.pop().replace(/\.git$/, '');
        this.org = remoteUrlParts.pop();
    }
    executeCommand(command, args, debug) {
        args.unshift(command);
        if (debug) {
            debug('Your git-log command is:\ngit ' + args.join(' '));
        }
        const result = shelljs_1.exec(['git', ...args].join(' '), { cwd: this.pathToRepo, silent: true });
        return result.stdout.trim();
    }
}
exports.GitRepo = GitRepo;
//# sourceMappingURL=git.js.map