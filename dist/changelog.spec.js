"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const changelog_1 = require("./changelog");
const git_1 = require("./util/git");
const blueprint_mock_1 = require("./blueprint-mock");
const nunjucks_1 = require("nunjucks");
describe('Changelog', () => {
    let blueprint;
    let repo;
    let changelog;
    beforeEach(() => {
        blueprint = new blueprint_mock_1.MockBlueprint();
        repo = new git_1.GitRepo();
        changelog = new changelog_1.Changelog(blueprint, repo, { info() { } });
    });
    describe('getChanges()', () => {
        it('should filter commits that are in both branches', () => {
            const commits = changelog.getChanges('test-1', 'test-2')
                .map(commit => commit.toString());
            chai_1.expect(commits).to.eql([
                // 'revert:feat(B): title B',  -- revert of commit below
                'feat(E): title E',
                // 'refactor(B): refactor B',  -- not whitelisted
                // 'perf(D): title D',         -- already in test-2
                // 'chore(C): title C',        -- already in test-2
                // 'feat(B): title B',         -- reverted in commit above
                'fix(A): title A',
                // 'docs(README): add it'      -- not whitelisted
            ]);
        });
    });
    describe('render()', () => {
        it('should call `configureRenderer` if it is available', () => {
            chai_1.expect(blueprint.env).to.be.instanceof(nunjucks_1.Environment);
        });
    });
});
//# sourceMappingURL=changelog.spec.js.map