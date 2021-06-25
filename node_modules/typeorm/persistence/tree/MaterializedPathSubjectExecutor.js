"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterializedPathSubjectExecutor = void 0;
var tslib_1 = require("tslib");
var OrmUtils_1 = require("../../util/OrmUtils");
/**
 * Executes subject operations for materialized-path tree entities.
 */
var MaterializedPathSubjectExecutor = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function MaterializedPathSubjectExecutor(queryRunner) {
        this.queryRunner = queryRunner;
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Executes operations when subject is being inserted.
     */
    MaterializedPathSubjectExecutor.prototype.insert = function (subject) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var parent, parentId, parentPath, insertedEntityId;
            var _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        parent = subject.metadata.treeParentRelation.getEntityValue(subject.entity);
                        if (!parent && subject.parentSubject && subject.parentSubject.entity) // if entity was attached via children
                            parent = subject.parentSubject.insertedValueSet ? subject.parentSubject.insertedValueSet : subject.parentSubject.entity;
                        parentId = subject.metadata.getEntityIdMap(parent);
                        parentPath = "";
                        if (!parentId) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getEntityPath(subject, parentId)];
                    case 1:
                        parentPath = _b.sent();
                        _b.label = 2;
                    case 2:
                        insertedEntityId = subject.metadata.treeParentRelation.joinColumns.map(function (joinColumn) {
                            return joinColumn.referencedColumn.getEntityValue(subject.insertedValueSet);
                        }).join("_");
                        return [4 /*yield*/, this.queryRunner.manager
                                .createQueryBuilder()
                                .update(subject.metadata.target)
                                .set((_a = {},
                                _a[subject.metadata.materializedPathColumn.propertyPath] = parentPath + insertedEntityId + ".",
                                _a))
                                .where(subject.identifier)
                                .execute()];
                    case 3:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Executes operations when subject is being updated.
     */
    MaterializedPathSubjectExecutor.prototype.update = function (subject) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var newParent, entity, oldParent, oldParentId, newParentId, newParentPath, oldParentPath, entityPath, propertyPath;
            var _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        newParent = subject.metadata.treeParentRelation.getEntityValue(subject.entity);
                        if (!newParent && subject.parentSubject && subject.parentSubject.entity) // if entity was attached via children
                            newParent = subject.parentSubject.entity;
                        entity = subject.databaseEntity;
                        if (!entity && newParent) // if entity was attached via children
                            entity = subject.metadata.treeChildrenRelation.getEntityValue(newParent).find(function (child) {
                                return Object.entries(subject.identifier).every(function (_a) {
                                    var _b = tslib_1.__read(_a, 2), key = _b[0], value = _b[1];
                                    return child[key] === value;
                                });
                            });
                        oldParent = subject.metadata.treeParentRelation.getEntityValue(entity);
                        oldParentId = subject.metadata.getEntityIdMap(oldParent);
                        newParentId = subject.metadata.getEntityIdMap(newParent);
                        // Exit if the new and old parents are the same
                        if (OrmUtils_1.OrmUtils.compareIds(oldParentId, newParentId)) {
                            return [2 /*return*/];
                        }
                        newParentPath = "";
                        if (!newParentId) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getEntityPath(subject, newParentId)];
                    case 1:
                        newParentPath = _b.sent();
                        _b.label = 2;
                    case 2:
                        oldParentPath = "";
                        if (!oldParentId) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.getEntityPath(subject, oldParentId)];
                    case 3:
                        oldParentPath = (_b.sent()) || "";
                        _b.label = 4;
                    case 4:
                        entityPath = subject.metadata.treeParentRelation.joinColumns.map(function (joinColumn) {
                            return joinColumn.referencedColumn.getEntityValue(entity);
                        }).join("_");
                        propertyPath = subject.metadata.materializedPathColumn.propertyPath;
                        return [4 /*yield*/, this.queryRunner.manager
                                .createQueryBuilder()
                                .update(subject.metadata.target)
                                .set((_a = {},
                                _a[propertyPath] = function () { return "REPLACE(" + propertyPath + ", '" + oldParentPath + entityPath + ".', '" + newParentPath + entityPath + ".')"; },
                                _a))
                                .where(propertyPath + " LIKE :path", { path: "" + oldParentPath + entityPath + ".%" })
                                .execute()];
                    case 5:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MaterializedPathSubjectExecutor.prototype.getEntityPath = function (subject, id) {
        return this.queryRunner.manager
            .createQueryBuilder()
            .select(subject.metadata.targetName + "." + subject.metadata.materializedPathColumn.propertyPath, "path")
            .from(subject.metadata.target, subject.metadata.targetName)
            .whereInIds(id)
            .getRawOne()
            .then(function (result) { return result ? result["path"] : undefined; });
    };
    return MaterializedPathSubjectExecutor;
}());
exports.MaterializedPathSubjectExecutor = MaterializedPathSubjectExecutor;

//# sourceMappingURL=MaterializedPathSubjectExecutor.js.map
