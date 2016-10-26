"use strict";
var path_1 = require('path');
var _1 = require('.');
var REVERT_MATCHER = /^(revert:|Revert )(.+)/;
//                      1111111  2222222         3333
var FORMAT_MATCHER = /([^(]+)\(([^)]+)\)\s*:\s*(.+)/;
// 1=type; 2=scope; 3=title
var BC_MARKER = /^BREAKING CHANGE/;
//                         1111111111111111111111111111111111111111111111
//                          2222222222222 4444444444444 666666666666666    88888888888888888888888888888
//                                33333       5555555           77777       999999999   10101010 111111
var CLOSES_MATCHER = /\s+((close(s|d)?)|(fix(es|ed)?)|(resolve(s|d)?))\s+(([^\/ ]+)\/([^\/ ]+)?(#\d+))\s+/ig;
// 9 = org; 10 = repo; 11=issue
var typeWhiteList = ['feat', 'fix', 'perf'];
function setWhitelist(value) {
    typeWhiteList = value;
}
exports.setWhitelist = setWhitelist;
var MockBlueprint = (function () {
    function MockBlueprint() {
        this.name = 'AngularJS';
    }
    MockBlueprint.prototype.getTemplateFolder = function () {
        return path_1.resolve(__dirname, 'templates');
    };
    MockBlueprint.prototype.getTemplateName = function () {
        return 'changelog.njk';
    };
    MockBlueprint.prototype.parseMessage = function (message) {
        var commit = new _1.Commit(message);
        var _a = message.split('\n'), hash = _a[0], header = _a[1], bodyLines = _a.slice(2);
        commit.hash = hash;
        header = header.replace(REVERT_MATCHER, function (_, revertMarker, rest) {
            commit.isRevert = true;
            if (rest.indexOf('"') === 0 && rest.lastIndexOf('"') === rest.length - 1) {
                rest = rest.substring(1, rest.length - 1);
            }
            return rest;
        });
        var matches = FORMAT_MATCHER.exec(header);
        if (!matches)
            return null;
        commit.type = matches[1], commit.scope = matches[2], commit.title = matches[3];
        var bcLine = 0;
        while (bcLine < bodyLines.length) {
            if (BC_MARKER.test(bodyLines[bcLine]))
                break;
            bcLine += 1;
        }
        commit.body = bodyLines.slice(0, bcLine).join('\n');
        commit.bcMessage = bodyLines.slice(bcLine + 1).join('\n');
        commit.closes = [];
        commit.body = extractCloses(commit.body, commit.closes);
        commit.bcMessage = extractCloses(commit.bcMessage, commit.closes);
        if (commit.isRevert) {
            // Create a revert commit that matches this commit
            var revertCommit = new _1.Commit();
            revertCommit.type = commit.type;
            revertCommit.scope = commit.scope;
            revertCommit.title = commit.title;
            commit.revertCommit = revertCommit;
        }
        return commit;
    };
    MockBlueprint.prototype.filterCommit = function (commit) {
        return typeWhiteList.indexOf(commit.type) !== -1;
    };
    MockBlueprint.prototype.compareCommits = function (left, right) {
        return left.toString() === right.toString();
    };
    MockBlueprint.prototype.configureRenderer = function (env) {
        this.env = env;
    };
    return MockBlueprint;
}());
exports.MockBlueprint = MockBlueprint;
function extractCloses(field, closes) {
    return field.replace(CLOSES_MATCHER, function () {
        closes.push({
            org: arguments[9],
            repo: arguments[10],
            id: arguments[11]
        });
        return ' ';
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = new MockBlueprint();
