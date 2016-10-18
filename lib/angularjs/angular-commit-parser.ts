import {Commit} from '../commit';
import {ICommitParser} from '../commit-parser';

const REVERT_MARKER = 'revert:';

//                      1111111  2222222         3333
const FORMAT_MATCHER = /([^(]+)\(([^)]+)\)\s*:\s*(.+)/;
// 1=type; 2=scope; 3=title

const BC_MARKER = /^BREAKING CHANGE/;

//                      1111111111111111111111111111111111111111111111
//                       22222222222222 4444444444444 666666666666666    8888888888888888888888888
//                              33333       5555555           77777       9999999999999999 101010
const CLOSES_MATCHER = /\s+((closes(s|d)?)|(fix(es|ed)?)|(resolve(s|d)?))\s+(([^\/]+\/[^\/]+)?(#\d+))\s+/


export class AngularCommitParser implements ICommitParser {

  typeWhiteList = ['feat', 'fix', 'perf'];

  parseMessage(message: string) : Commit {
    const commit = new Commit();
    let [hash, header, ...bodyLines] = message.split('\n');

    commit.hash = hash;

    if (startsWith(header, REVERT_MARKER)) {
      commit.isRevert = true;
      header = header.replace(REVERT_MARKER, '');
    }

    [, commit.type, commit.scope, commit.title] = FORMAT_MATCHER.exec(header);
    let bcLine = 0;
    while(bcLine < bodyLines.length) {
      if (BC_MARKER.test(bodyLines[bcLine])) break;
      bcLine += 1;
    }
    commit.body = bodyLines.slice(0, bcLine).join('\n');
    commit.bcMessage = bodyLines.slice(bcLine+1).join('\n');
    commit.closes = [];
    commit.body = extractCloses(commit.body, commit.closes);
    commit.bcMessage = extractCloses(commit.bcMessage, commit.closes);

    return commit;
  }

  filterCommit(commit: Commit) {
    return this.typeWhiteList.indexOf(commit.type) !== -1;
  }

  compareCommits(left: Commit, right: Commit) {
    return left.toString() === right.toString();
  }
}


function startsWith(haystack: string, needle: string) {
  return haystack.slice(0, needle.length) === needle;
}

function extractCloses(field: string, closes: string[]) : string {
  return field.replace(CLOSES_MATCHER, function() {
    closes.push(arguments[8]);
    return ' ';
  });
}