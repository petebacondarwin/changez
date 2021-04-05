"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const git_1 = require("./git");
const chai_1 = require("chai");
const sinon_1 = require("sinon");
const sinonChai = require("sinon-chai");
describe('GitRepo', () => {
    let repo;
    beforeEach(() => {
        chai_1.use(sinonChai);
        repo = new git_1.GitRepo();
    });
    describe('getCurrentBranch()', () => {
        it('should return the current branch name', () => {
            // not a clever test in case we are not on master :-)
            // expect(repo.currentBranch()).to.equal('master');
        });
    });
    describe('rawCommits()', () => {
        describe('default config', () => {
            it('should return init commit last', () => {
                const commit = repo.rawCommits({}).pop();
                chai_1.expect(commit).to.equal('1bd9c1c418ad2a963d7640c7215ac42f9dfc8c30\ninit');
            });
        });
        describe('with `from` config', () => {
            it('should return commits after the specified commit', () => {
                const commit = repo.rawCommits({ from: '1bd9c1c418ad2a963d7640c7215ac42f9dfc8c30' }).pop();
                chai_1.expect(commit).to.equal('5f40c495bbf39e9cdcd2ce7aaaca21fb985b1dba\nbasic git log working');
            });
        });
        describe('with `to` config', () => {
            it('should return commits up to and including the specified commit', () => {
                const commits = repo.rawCommits({ to: '5f40c495bbf39e9cdcd2ce7aaaca21fb985b1dba' });
                chai_1.expect(commits).to.eql([
                    '5f40c495bbf39e9cdcd2ce7aaaca21fb985b1dba\nbasic git log working',
                    '1bd9c1c418ad2a963d7640c7215ac42f9dfc8c30\ninit'
                ]);
            });
        });
        describe('with `debug` config', () => {
            it('should call the debug function with the git log command', () => {
                let debugOutput;
                const commits = repo.rawCommits({
                    from: '1bd9c1c418ad2a963d7640c7215ac42f9dfc8c30',
                    to: '5f40c495bbf39e9cdcd2ce7aaaca21fb985b1dba',
                    debug: (value) => { debugOutput = value; }
                });
                chai_1.expect(debugOutput).to.equal('Your git-log command is:\ngit log --format="%H%n%s%n%b%n------------------------ >8 ------------------------" 1bd9c1c418ad2a963d7640c7215ac42f9dfc8c30..5f40c495bbf39e9cdcd2ce7aaaca21fb985b1dba');
            });
        });
    });
    describe('latestTag', () => {
        it('should return the most recent tag for the given branch', () => {
            const tag = repo.latestTag({ branch: 'test-1' });
            chai_1.expect(tag).to.equal('test-start-tag');
        });
    });
    describe('commonAncestor', () => {
        it('should return the most recent ancestor', () => {
            const commit = repo.commonAncestor({ left: 'test-branch', right: 'master' });
            chai_1.expect(commit).to.equal('196ba6cad9dee140079ed48cf48088c86050c28a');
        });
    });
    describe('computeRemoteInfo', () => {
        it('should execute a git remote command', () => {
            const spy = sinon_1.replace(repo, 'executeCommand', sinon_1.fake.returns('https://github.com/angular/angular.js'));
            repo.computeRemoteInfo('origin');
            chai_1.expect(spy).to.have.been.calledWith('remote', ['get-url', 'origin']);
        });
        it('should extract the org and repo from the remote github path', () => {
            const spy = sinon_1.replace(repo, 'executeCommand', sinon_1.fake.returns('https://github.com/angular/angular.js'));
            repo.computeRemoteInfo('origin');
            chai_1.expect(repo.org).to.equal('angular');
            chai_1.expect(repo.repo).to.equal('angular.js');
        });
        it('should remove ".git" from the end of the remote path', () => {
            const spy = sinon_1.replace(repo, 'executeCommand', sinon_1.fake.returns('https://github.com/angular/angular.js.git'));
            repo.computeRemoteInfo('origin');
            chai_1.expect(repo.org).to.equal('angular');
            chai_1.expect(repo.repo).to.equal('angular.js');
        });
    });
});
//# sourceMappingURL=git.spec.js.map