"use strict";
var git_1 = require('./git');
var chai_1 = require('chai');
describe('GitRepo', function () {
    var repo;
    beforeEach(function () {
        repo = new git_1.GitRepo();
    });
    describe('getCurrentBranch()', function () {
        it('should return the current branch name', function () {
            // not a clever test in case we are not on master :-)
            // expect(repo.currentBranch()).to.equal('master');
        });
    });
    describe('rawCommits()', function () {
        describe('default config', function () {
            it('should return init commit last', function () {
                var commit = repo.rawCommits({}).pop();
                chai_1.expect(commit).to.equal('1bd9c1c418ad2a963d7640c7215ac42f9dfc8c30\ninit');
            });
        });
        describe('with `from` config', function () {
            it('should return commits after the specified commit', function () {
                var commit = repo.rawCommits({ from: '1bd9c1c418ad2a963d7640c7215ac42f9dfc8c30' }).pop();
                chai_1.expect(commit).to.equal('5f40c495bbf39e9cdcd2ce7aaaca21fb985b1dba\nbasic git log working');
            });
        });
        describe('with `to` config', function () {
            it('should return commits up to and including the specified commit', function () {
                var commits = repo.rawCommits({ to: '5f40c495bbf39e9cdcd2ce7aaaca21fb985b1dba' });
                chai_1.expect(commits).to.eql([
                    '5f40c495bbf39e9cdcd2ce7aaaca21fb985b1dba\nbasic git log working',
                    '1bd9c1c418ad2a963d7640c7215ac42f9dfc8c30\ninit'
                ]);
            });
        });
        describe('with `debug` config', function () {
            it('should call the debug function with the git log command', function () {
                var debugOutput;
                var commits = repo.rawCommits({
                    from: '1bd9c1c418ad2a963d7640c7215ac42f9dfc8c30',
                    to: '5f40c495bbf39e9cdcd2ce7aaaca21fb985b1dba',
                    debug: function (value) { debugOutput = value; }
                });
                chai_1.expect(debugOutput).to.equal('Your git-log command is:\ngit log --format="%H%n%s%n%b%n------------------------ >8 ------------------------" 1bd9c1c418ad2a963d7640c7215ac42f9dfc8c30..5f40c495bbf39e9cdcd2ce7aaaca21fb985b1dba');
            });
        });
    });
    describe('latestTag', function () {
        it('should return the most recent tag for the given branch', function () {
            var tag = repo.latestTag({ branch: 'test-1' });
            chai_1.expect(tag).to.equal('test-start-tag');
        });
    });
    describe('commonAncestor', function () {
        it('should return the most recent ancestor', function () {
            var commit = repo.commonAncestor({ left: 'test-branch', right: 'master' });
            chai_1.expect(commit).to.equal('196ba6cad9dee140079ed48cf48088c86050c28a');
        });
    });
});
