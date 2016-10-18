import { resolve } from 'path';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/concatMap';
import './from-stream';
import { execFile } from 'child_process';

const SPLIT_MARKER = '------------------------ >8 ------------------------';

export class GitRepo {

  pathToRepo: string;

  constructor(pathToRepo: string = '.') {
    this.pathToRepo = resolve(pathToRepo);
  }

  // default is format is hash-subject-body
  rawCommits({debug, format = '%H%n%s%n%b', from = '', to = 'HEAD'}:
              {debug?: (value: string) => void, format?: string, from?: string, to?: string}) {

    const gitFormat = `--format=${format}%n${SPLIT_MARKER}`;
    const gitFromTo = from ? `${from}..${to}` : to;

    return this.executeCommand('log', [gitFormat, gitFromTo], debug)
              .concatMap((item: string) => item.split(SPLIT_MARKER))
              .map((item: string) => item.trim())
              .filter((item: string) => item);
  }

  latestTag({branch = '', debug}: {branch: string, debug?: (value: string) => void}) {
    const args = [
      '--tags',
      '--abbrev=0',
      branch
    ];
    return this.executeCommand('describe', args, debug);
  }


  private executeCommand(command: string, args: string[], debug: (value: string) => void) {
    args.unshift(command);

    if (debug) {
      debug('Your git-log command is:\ngit ' + args.join(' '));
    }
    const child = execFile('git', args, { maxBuffer: Infinity, cwd: this.pathToRepo });
    return Observable.fromStream(child.stdout);
  }
}


///