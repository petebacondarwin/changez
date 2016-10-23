"use strict";
var Commit = (function () {
    function Commit(raw) {
        if (raw === void 0) { raw = ''; }
        this.raw = raw;
        this.isRevert = false;
    }
    Commit.prototype.toString = function () {
        var revertMarker = this.isRevert ? 'revert:' : '';
        return "" + revertMarker + this.type + "(" + this.scope + "): " + this.title;
    };
    return Commit;
}());
exports.Commit = Commit;
