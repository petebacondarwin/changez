import {resolve} from 'path';
import {exec, ExecOptions} from 'shelljs';

const SPLIT_MARKER = '------------------------ >8 ------------------------';

/**
 * A helper class that represents a Git repository.
 */
export class GitRepo {

  /**
   * The absolute path to the local folder containing the git repository
   */
  pathToRepo: string;

  /**
   * The github organisation/user that holds a copy of this repository
   * This is computed by reading a specified remote from the local git repository.
   */
  org: string;

  /**
   * The name of this repository in github.
   * This is computed by reading a specified remote from the local git repository.
   */
  repo: string;

  /**
   * Create a new instance of this class
   * @param pathToRepo a path to the local git repository;
   *                   can be relative to the current working directory;
   *                   defaults to `'.'`.
   * @param remote the git remote to use when computing the github `org` and `repo`;
   *               defaults to `'origin'`.
   */
  constructor(pathToRepo: string = '.', remote = 'origin') {
    this.pathToRepo = resolve(pathToRepo);
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
  rawCommits({debug, format = '%H%n%s%n%b', from = '', to = 'HEAD'}:
              {debug?: (value: string) => void, format?: string, from?: string, to?: string}) {

    const gitFormat = `--format="${format}%n${SPLIT_MARKER}"`;
    const gitFromTo = from ? `${from}..${to}` : to;

    return this.executeCommand('log', [gitFormat, gitFromTo], debug)
              .split(SPLIT_MARKER)
              .map((item: string) => item.trim())
              .filter((item: string) => !!item);
  }

  /**
   * Get the most recent tag on the given branch; defaults to the current branch
   */
  latestTag({branch = '', debug}: {branch: string, debug?: (value: string) => void}) {
    return this.executeCommand('describe', ['--tags', '--abbrev=0', branch], debug);
  }

  /**
   * Get the most recent commit that is an ancestor of both the `left` and `right` branches.
   */
  commonAncestor({left, right, debug}: {left: string, right: string, debug?: (value: string) => void}) {
    return this.executeCommand('merge-base', [left, right], debug);
  }

  private computeRemoteInfo(remote: string) {
    const remoteUrlParts = this.executeCommand('remote', ['get-url', remote], undefined).split('/');
    this.repo = remoteUrlParts.pop();
    this.org = remoteUrlParts.pop();
  }

  private executeCommand(command: string, args: string[], debug: (value: string) => void): string {
    args.unshift(command);

    if (debug) {
      debug('Your git-log command is:\ngit ' + args.join(' '));
    }
    const result = exec(['git', ...args].join(' '), { cwd: this.pathToRepo, silent: true } as ExecOptions) as any;
    return result.stdout.trim();
  }
}