import {resolve} from 'path';
import {exec, ExecOptions} from 'shelljs';

const SPLIT_MARKER = '------------------------ >8 ------------------------';

export class GitRepo {

  pathToRepo: string;

  constructor(pathToRepo: string = '.') {
    this.pathToRepo = resolve(pathToRepo);
  }

  // default is format is hash-subject-body
  rawCommits({debug, format = '%H%n%s%n%b', from = '', to = 'HEAD'}:
              {debug?: (value: string) => void, format?: string, from?: string, to?: string}) {

    const gitFormat = `--format="${format}%n${SPLIT_MARKER}"`;
    const gitFromTo = from ? `${from}..${to}` : to;

    return this.executeCommand('log', [gitFormat, gitFromTo], debug)
              .split(SPLIT_MARKER)
              .map((item: string) => item.trim())
              .filter((item: string) => !!item);
  }

  latestTag({branch = '', debug}: {branch: string, debug?: (value: string) => void}) {
    return this.executeCommand('describe', ['--tags', '--abbrev=0', branch], debug);
  }

  commonAncestor({left, right, debug}: {left: string, right: string, debug?: (value: string) => void}) {
    return this.executeCommand('merge-base', [left, right], debug);
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