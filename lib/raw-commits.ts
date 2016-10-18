import { Observable } from 'rxjs';
import 'rxjs/add/operator/concatMap';
import './from-stream';
import { execFile } from 'child_process';

interface IOptions {
  format?: string;
  from?: string;
  to?: string;
  debug?: (string) => void;
}

const SPLIT_MARKER = '------------------------ >8 ------------------------';

export function rawCommits(options: IOptions) : Observable<string> {

  options = options || {};
  // default is format is hash-subject-body
  options.format = options.format || '%H%n%s%n%b';
  options.from = options.from || '';
  options.to = options.to || 'HEAD';

  const gitFormat = `--format=${options.format}%n${SPLIT_MARKER}`;
  const gitFromTo = options.from ? `${options.from}..${options.to}` : options.to;

  const args = [
    'log',
    gitFormat,
    gitFromTo
  ];

  if (options.debug) {
    options.debug('Your git-log command is:\ngit ' + args.join(' '));
  }

  let isError = false;
  const child = execFile('git', args, { maxBuffer: Infinity });

  return Observable.fromStream(child.stdout)
            .concatMap((item: string) => item.split(SPLIT_MARKER))
            .map((item: string) => item.trim())
            .filter((item: string) => item);
}