"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NestedSetMultipleRootError = void 0;
var tslib_1 = require("tslib");
var NestedSetMultipleRootError = /** @class */ (function (_super) {
    tslib_1.__extends(NestedSetMultipleRootError, _super);
    function NestedSetMultipleRootError() {
        var _this = _super.call(this) || this;
        _this.name = "NestedSetMultipleRootError";
        Object.setPrototypeOf(_this, NestedSetMultipleRootError.prototype);
        _this.message = "Nested sets do not support multiple root entities.";
        return _this;
    }
    return NestedSetMultipleRootError;
}(Error));
exports.NestedSetMultipleRootError = NestedSetMultipleRootError;

//# sourceMappingURL=NestedSetMultipleRootError.js.map
