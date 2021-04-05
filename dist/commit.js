"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Commit = void 0;
/**
 * Represents a parsed commit
 */
class Commit {
    /**
     * Create a new commit providing the original raw commit message.
     * The blueprint will be responsible for populating the other properties as part of
     * its parsing.
     */
    constructor(raw = '') {
        this.raw = raw;
        /**
         * Does this commit revert another commit?
         */
        this.isRevert = false;
    }
    /**
     * Generate a human readable representation of this commit
     */
    toString() {
        const revertMarker = this.isRevert ? 'revert:' : '';
        return `${revertMarker}${this.type}(${this.scope}): ${this.title}`;
    }
}
exports.Commit = Commit;
//# sourceMappingURL=commit.js.map