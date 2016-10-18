import {Observable} from 'rxjs';
import {Commit} from './commit';
import {parseMessage} from './parse-message';

let _whitelist = [
  'feat', 'fix'
];

export function setWhitelist(whitelist: string[]) {
  _whitelist = whitelist;
}
export function getWhitelist() {
  return _whitelist;
}
function isWhitelisted(type: string) {
  return _whitelist.indexOf(type) !== -1;
}

export function filterCommits(rawCommit$: Observable<string>) {
  return rawCommit$
            .map(parseMessage)
            .filter((commit) => {
              console.log(commit);
              return isWhitelisted(commit.type) ||
              commit.isRevert && isWhitelisted(commit.revertCommit.type)
            });
}