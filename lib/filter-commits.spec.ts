import {Observable} from 'rxjs';
import 'rxjs/add/operator/toArray';
import {filterCommits, getWhitelist, setWhitelist} from './filter-commits';
import {expect} from 'chai';

describe('whitelist', () => {
  let originalWhitelist;

  beforeEach(() => { originalWhitelist = getWhitelist(); });
  afterEach(() => { setWhitelist(originalWhitelist); });

  it('should set and get the whitelist', () => {
    expect(getWhitelist()).to.eql(['feat', 'fix']);
    setWhitelist(['a', 'b']);
    expect(getWhitelist()).to.eql(['a', 'b']);
  });
});

describe('filteredCommits()', () => {
  it('should only keep whitelisted commits', () => {
    const rawCommit$ = Observable.from([
      'ABC123\nchore(package.json): change dependencies',
      'DEF456\nfix(mod): make it work',
      'GAB789\nfeat(shiny): add shiny new thing',
      'CDE012\nrefactor(shiny): make even shinier',
      'FGA345\nrevert:fix(mod): make it work'
    ]);

    const filtered$ = filterCommits(rawCommit$)
                        .map((commit) => commit.toString())
                        .toArray()
                        .subscribe((commits) => {
                          expect(commits).to.eql([
                            'fix(mod): make it work',
                            'feat(shiny): add shiny new thing',
                            'revert:fix(mod): make it work'
                          ]);
                        });
  });
});
