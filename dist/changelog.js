"use strict";
var nunjucks = require('nunjucks');
var Changelog = (function () {
    function Changelog(blueprint, repo, log) {
        this.blueprint = blueprint;
        this.repo = repo;
        this.log = log;
        var env = nunjucks.configure(blueprint.getTemplateFolder(), { autoescape: false });
        if (blueprint.configureRenderer)
            blueprint.configureRenderer(env);
    }
    // Get a list of commits in the fromBranch that were not cherry-picked from the excludeBranch
    Changelog.prototype.getChanges = function (fromBranch, excludeBranch) {
        if (fromBranch === void 0) { fromBranch = this.repo.currentBranch(); }
        var lastTagInFromBranch = this.repo.latestTag({ branch: fromBranch });
        var commonCommit = this.repo.commonAncestor({ left: fromBranch, right: excludeBranch });
        var changes = this.getCommits(lastTagInFromBranch, fromBranch);
        this.log.info("Found " + changes.length + " commits from \"" + fromBranch + "\" since tag \"" + lastTagInFromBranch + "\" to include.");
        if (excludeBranch) {
            var excludeCommits = this.getCommits(commonCommit, excludeBranch);
            this.log.info("Found " + excludeCommits.length + " commits from \"" + excludeBranch + "\" to exclude, since \"" + fromBranch + "\" split at \"" + commonCommit + "\".");
            changes = this.excludeCommits(changes, excludeCommits);
        }
        var preRevertFilterCount = changes.length;
        changes = this.filterReverts(changes);
        this.log.info("Removed " + (preRevertFilterCount - changes.length) + " revert related commits.");
        var preBlueprintFilterCount = changes.length;
        changes = this.filterCommits(changes);
        this.log.info("Removed " + (preBlueprintFilterCount - changes.length) + " blueprint filtered commits.");
        return changes;
    };
    Changelog.prototype.render = function (commits, version, codename, date) {
        var types = groupBy(commits, 'type');
        Object.keys(types).forEach(function (type) {
            types[type] = groupBy(types[type], 'scope');
        });
        var breakingChanges = commits.filter(function (commit) { return !!commit.bcMessage; });
        this.log.info("There are " + breakingChanges.length + " commit(s) with breaking change notices.");
        return nunjucks.render(this.blueprint.getTemplateName(), {
            org: this.repo.org,
            repo: this.repo.repo,
            version: version,
            codename: codename,
            date: date,
            types: types,
            commits: commits,
            breakingChanges: breakingChanges
        });
    };
    // Get a list of commits between `from` and `to`
    Changelog.prototype.getCommits = function (from, to) {
        var _this = this;
        return this.repo.rawCommits({ to: to, from: from })
            .map(function (commit) { return _this.blueprint.parseMessage(commit); })
            .filter(function (commit) { return !!commit; });
    };
    // Filter out commits from `commits` that match commits in `excludes`
    Changelog.prototype.excludeCommits = function (commits, excludes) {
        var _this = this;
        return commits.filter(function (commit) { return !excludes.some(function (exclude) {
            var equal = _this.blueprint.compareCommits(commit, exclude);
            return equal;
        }); });
    };
    // Use the current parser to filter the commit stream
    Changelog.prototype.filterCommits = function (commit) {
        var _this = this;
        return commit.filter(function (commit) {
            try {
                return commit && _this.blueprint.filterCommit(commit);
            }
            catch (e) {
                _this.log.warn(e.message);
                _this.log.warn(commit.toString());
                return true;
            }
        });
    };
    Changelog.prototype.filterReverts = function (commits) {
        var _this = this;
        var revertsToRemove = {};
        var reverts = commits.filter(function (commit) { return commit.isRevert; });
        var filteredCommits = commits.filter(function (commit) {
            var revert = find(reverts, commit, function (revert, commit) {
                return _this.blueprint.compareCommits(revert.revertCommit, commit);
            });
            if (revert)
                revertsToRemove[revert.hash] = revert;
            return !revert;
        });
        filteredCommits = filteredCommits.filter(function (commit) { return !revertsToRemove[commit.hash]; });
        return filteredCommits;
    };
    return Changelog;
}());
exports.Changelog = Changelog;
function find(haystack, needle, isEqual) {
    for (var i = 0; i < haystack.length; ++i) {
        if (isEqual(haystack[i], needle)) {
            return haystack[i];
        }
    }
}
function groupBy(collection, key) {
    var groupObj = {};
    collection.forEach(function (item) {
        var group = groupObj[item[key]] || [];
        group.push(item);
        groupObj[item[key]] = group;
    });
    return groupObj;
}
