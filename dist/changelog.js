"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Changelog = void 0;
const nunjucks = require("nunjucks");
class Changelog {
    constructor(blueprint, repo, log) {
        this.blueprint = blueprint;
        this.repo = repo;
        this.log = log;
        const env = nunjucks.configure(blueprint.getTemplateFolder(), { autoescape: false });
        if (blueprint.configureRenderer)
            blueprint.configureRenderer(env);
    }
    // Get a list of commits in the fromBranch that were not cherry-picked from the excludeBranch
    getChanges(fromBranch = this.repo.currentBranch(), excludeBranch) {
        const lastTagInFromBranch = this.repo.latestTag({ branch: fromBranch });
        const commonCommit = this.repo.commonAncestor({ left: fromBranch, right: excludeBranch });
        let changes = this.getCommits(lastTagInFromBranch, fromBranch);
        this.log.info(`Found ${changes.length} commits from "${fromBranch}" since tag "${lastTagInFromBranch}" to include.`);
        if (excludeBranch) {
            const excludeCommits = this.getCommits(commonCommit, excludeBranch);
            this.log.info(`Found ${excludeCommits.length} commits from "${excludeBranch}" to exclude, since "${fromBranch}" split at "${commonCommit}".`);
            changes = this.excludeCommits(changes, excludeCommits);
        }
        const preRevertFilterCount = changes.length;
        changes = this.filterReverts(changes);
        this.log.info(`Removed ${preRevertFilterCount - changes.length} revert related commits.`);
        const preBlueprintFilterCount = changes.length;
        changes = this.filterCommits(changes);
        this.log.info(`Removed ${preBlueprintFilterCount - changes.length} blueprint filtered commits.`);
        return changes;
    }
    render(commits, version, codename, date) {
        const types = groupBy(commits, 'type');
        Object.keys(types).forEach((type) => {
            types[type] = groupBy(types[type], 'scope');
        });
        const breakingChanges = commits.filter(commit => !!commit.bcMessage);
        this.log.info(`There are ${breakingChanges.length} commit(s) with breaking change notices.`);
        return nunjucks.render(this.blueprint.getTemplateName(), {
            org: this.repo.org,
            repo: this.repo.repo,
            version,
            codename,
            date,
            types,
            commits,
            breakingChanges
        });
    }
    // Get a list of commits between `from` and `to`
    getCommits(from, to) {
        return this.repo.rawCommits({ to, from })
            .map(commit => this.blueprint.parseMessage(commit))
            .filter(commit => !!commit);
    }
    // Filter out commits from `commits` that match commits in `excludes`
    excludeCommits(commits, excludes) {
        return commits.filter(commit => !excludes.some(exclude => {
            const equal = this.blueprint.compareCommits(commit, exclude);
            return equal;
        }));
    }
    // Use the current parser to filter the commit stream
    filterCommits(commit) {
        return commit.filter(commit => {
            try {
                return commit && this.blueprint.filterCommit(commit);
            }
            catch (e) {
                this.log.warn(e.message);
                this.log.warn(commit.toString());
                return true;
            }
        });
    }
    filterReverts(commits) {
        const revertsToRemove = {};
        const reverts = commits.filter(commit => commit.isRevert);
        let filteredCommits = commits.filter(commit => {
            const revert = find(reverts, commit, (revert, commit) => this.blueprint.compareCommits(revert.revertCommit, commit));
            if (revert)
                revertsToRemove[revert.hash] = revert;
            return !revert;
        });
        filteredCommits = filteredCommits.filter(commit => !revertsToRemove[commit.hash]);
        return filteredCommits;
    }
}
exports.Changelog = Changelog;
function find(haystack, needle, isEqual) {
    for (let i = 0; i < haystack.length; ++i) {
        if (isEqual(haystack[i], needle)) {
            return haystack[i];
        }
    }
}
function groupBy(collection, key) {
    const groupObj = {};
    collection.forEach((item) => {
        const group = groupObj[item[key]] || [];
        group.push(item);
        groupObj[item[key]] = group;
    });
    return groupObj;
}
//# sourceMappingURL=changelog.js.map