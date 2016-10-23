import {Commit} from '../../commit';
import {IBlueprint} from '../../blueprint';

const REVERT_MATCHER = /^(revert:|Revert )(.+)/;

//                      1111111  2222222         3333
const FORMAT_MATCHER = /([^(]+)\(([^)]+)\)\s*:\s*(.+)/;
// 1=type; 2=scope; 3=title

const BC_MARKER = /^BREAKING CHANGE/;

//                      1111111111111111111111111111111111111111111111
//                       22222222222222 4444444444444 666666666666666    8888888888888888888888888
//                              33333       5555555           77777       9999999999999999 101010
const CLOSES_MATCHER = /\s+((closes(s|d)?)|(fix(es|ed)?)|(resolve(s|d)?))\s+(([^\/]+\/[^\/]+)?(#\d+))\s+/;

let typeWhiteList = ['feat', 'fix', 'perf'];

export function setWhitelist(value: string[]) {
  typeWhiteList = value;
}

export class AngularBlueprint implements IBlueprint {

  name = 'AngularJS';

  parseMessage(message: string): Commit {
    const commit = new Commit(message);
    let [hash, header, ...bodyLines] = message.split('\n');

    commit.hash = hash;

    header = header.replace(REVERT_MATCHER, (_, revertMarker, rest: string) => {
      commit.isRevert = true;
      if (rest.indexOf('"') === 0 && rest.lastIndexOf('"') === rest.length - 1) {
        rest = rest.substring(1, rest.length - 1);
      }
      return rest;
    });

    const matches = FORMAT_MATCHER.exec(header);
    if (!matches) return null;

    [, commit.type, commit.scope, commit.title] = matches;
    let bcLine = 0;
    while (bcLine < bodyLines.length) {
      if (BC_MARKER.test(bodyLines[bcLine])) break;
      bcLine += 1;
    }
    commit.body = bodyLines.slice(0, bcLine).join('\n');
    commit.bcMessage = bodyLines.slice(bcLine + 1).join('\n');
    commit.closes = [];
    commit.body = extractCloses(commit.body, commit.closes);
    commit.bcMessage = extractCloses(commit.bcMessage, commit.closes);

    if (commit.isRevert) {
      // Create a revert commit that matches this commit
      const revertCommit = new Commit();
      revertCommit.type = commit.type;
      revertCommit.scope = commit.scope;
      revertCommit.title = commit.title;
      commit.revertCommit = revertCommit;
    }

    return commit;
  }

  filterCommit(commit: Commit) {
    return typeWhiteList.indexOf(commit.type) !== -1;
  }

  compareCommits(left: Commit, right: Commit) {
    return left.toString() === right.toString();
  }
}


function extractCloses(field: string, closes: string[]): string {
  return field.replace(CLOSES_MATCHER, function() {
    closes.push(arguments[8]);
    return ' ';
  });
}

export default new AngularBlueprint();