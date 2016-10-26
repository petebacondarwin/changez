"use strict";
var chai_1 = require('chai');
var changelog_1 = require('./changelog');
var git_1 = require('./util/git');
var blueprint_mock_1 = require('./blueprint-mock');
var nunjucks_1 = require('nunjucks');
describe('Changelog', function () {
    var blueprint;
    var repo;
    var changelog;
    beforeEach(function () {
        blueprint = new blueprint_mock_1.MockBlueprint();
        repo = new git_1.GitRepo();
        changelog = new changelog_1.Changelog(blueprint, repo, { info: function () { } });
    });
    describe('getChanges()', function () {
        it('should filter commits that are in both branches', function () {
            var commits = changelog.getChanges('test-1', 'test-2')
                .map(function (commit) { return commit.toString(); });
            chai_1.expect(commits).to.eql([
                // 'revert:feat(B): title B',  -- revert of commit below
                'feat(E): title E',
                // 'refactor(B): refactor B',  -- not whitelisted
                // 'perf(D): title D',         -- already in test-2
                // 'chore(C): title C',        -- already in test-2
                // 'feat(B): title B',         -- reverted in commit above
                'fix(A): title A',
            ]);
        });
    });
    describe('render()', function () {
        it('should call `configureRenderer` if it is available', function () {
            chai_1.expect(blueprint.env).to.be.instanceof(nunjucks_1.Environment);
        });
    });
});
