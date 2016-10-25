"use strict";
var path_1 = require('path');
var shelljs_1 = require('shelljs');
var SPLIT_MARKER = '------------------------ >8 ------------------------';
var GitRepo = (function () {
    function GitRepo(pathToRepo, remote) {
        if (pathToRepo === void 0) { pathToRepo = '.'; }
        if (remote === void 0) { remote = 'origin'; }
        this.pathToRepo = path_1.resolve(pathToRepo);
        this.computeRemoteInfo(remote);
    }
    GitRepo.prototype.currentBranch = function () {
        return this.executeCommand('symbolic-ref', ['--short HEAD'], undefined);
    };
    // default is format is hash-subject-body
    GitRepo.prototype.rawCommits = function (_a) {
        var debug = _a.debug, _b = _a.format, format = _b === void 0 ? '%H%n%s%n%b' : _b, _c = _a.from, from = _c === void 0 ? '' : _c, _d = _a.to, to = _d === void 0 ? 'HEAD' : _d;
        var gitFormat = "--format=\"" + format + "%n" + SPLIT_MARKER + "\"";
        var gitFromTo = from ? from + ".." + to : to;
        return this.executeCommand('log', [gitFormat, gitFromTo], debug)
            .split(SPLIT_MARKER)
            .map(function (item) { return item.trim(); })
            .filter(function (item) { return !!item; });
    };
    GitRepo.prototype.latestTag = function (_a) {
        var _b = _a.branch, branch = _b === void 0 ? '' : _b, debug = _a.debug;
        return this.executeCommand('describe', ['--tags', '--abbrev=0', branch], debug);
    };
    GitRepo.prototype.commonAncestor = function (_a) {
        var left = _a.left, right = _a.right, debug = _a.debug;
        return this.executeCommand('merge-base', [left, right], debug);
    };
    GitRepo.prototype.computeRemoteInfo = function (remote) {
        var remoteUrlParts = this.executeCommand('remote', ['get-url', remote], undefined).split('/');
        this.repo = remoteUrlParts.pop();
        this.org = remoteUrlParts.pop();
    };
    GitRepo.prototype.executeCommand = function (command, args, debug) {
        args.unshift(command);
        if (debug) {
            debug('Your git-log command is:\ngit ' + args.join(' '));
        }
        var result = shelljs_1.exec(['git'].concat(args).join(' '), { cwd: this.pathToRepo, silent: true });
        return result.stdout.trim();
    };
    return GitRepo;
}());
exports.GitRepo = GitRepo;
