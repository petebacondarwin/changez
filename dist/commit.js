"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Represents a parsed commit
 */
var Commit = /** @class */ (function () {
    /**
     * Create a new commit providing the original raw commit message.
     * The blueprint will be responsible for populating the other properties as part of
     * its parsing.
     */
    function Commit(raw) {
        if (raw === void 0) { raw = ''; }
        this.raw = raw;
        /**
         * Does this commit revert another commit?
         */
        this.isRevert = false;
    }
    /**
     * Generate a human readable representation of this commit
     */
    Commit.prototype.toString = function () {
        var revertMarker = this.isRevert ? 'revert:' : '';
        return "" + revertMarker + this.type + "(" + this.scope + "): " + this.title;
    };
    return Commit;
}());
exports.Commit = Commit;
