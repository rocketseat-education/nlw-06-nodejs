import { __extends } from "tslib";
var NestedSetMultipleRootError = /** @class */ (function (_super) {
    __extends(NestedSetMultipleRootError, _super);
    function NestedSetMultipleRootError() {
        var _this = _super.call(this) || this;
        _this.name = "NestedSetMultipleRootError";
        Object.setPrototypeOf(_this, NestedSetMultipleRootError.prototype);
        _this.message = "Nested sets do not support multiple root entities.";
        return _this;
    }
    return NestedSetMultipleRootError;
}(Error));
export { NestedSetMultipleRootError };

//# sourceMappingURL=NestedSetMultipleRootError.js.map
