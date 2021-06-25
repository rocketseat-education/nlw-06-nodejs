"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NestedSetSubjectExecutor = void 0;
var tslib_1 = require("tslib");
var OrmUtils_1 = require("../../util/OrmUtils");
var NestedSetMultipleRootError_1 = require("../../error/NestedSetMultipleRootError");
var NestedSetIds = /** @class */ (function () {
    function NestedSetIds() {
    }
    return NestedSetIds;
}());
/**
 * Executes subject operations for nested set tree entities.
 */
var NestedSetSubjectExecutor = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function NestedSetSubjectExecutor(queryRunner) {
        this.queryRunner = queryRunner;
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Executes operations when subject is being inserted.
     */
    NestedSetSubjectExecutor.prototype.insert = function (subject) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var escape, tableName, leftColumnName, rightColumnName, parent, parentId, parentNsRight, isUniqueRoot;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        escape = function (alias) { return _this.queryRunner.connection.driver.escape(alias); };
                        tableName = this.getTableName(subject.metadata.tablePath);
                        leftColumnName = escape(subject.metadata.nestedSetLeftColumn.databaseName);
                        rightColumnName = escape(subject.metadata.nestedSetRightColumn.databaseName);
                        parent = subject.metadata.treeParentRelation.getEntityValue(subject.entity);
                        if (!parent && subject.parentSubject && subject.parentSubject.entity) // if entity was attached via children
                            parent = subject.parentSubject.insertedValueSet ? subject.parentSubject.insertedValueSet : subject.parentSubject.entity;
                        parentId = subject.metadata.getEntityIdMap(parent);
                        parentNsRight = undefined;
                        if (!parentId) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.queryRunner.manager
                                .createQueryBuilder()
                                .select(subject.metadata.targetName + "." + subject.metadata.nestedSetRightColumn.propertyPath, "right")
                                .from(subject.metadata.target, subject.metadata.targetName)
                                .whereInIds(parentId)
                                .getRawOne()
                                .then(function (result) {
                                var value = result ? result["right"] : undefined;
                                // CockroachDB returns numeric types as string
                                return typeof value === "string" ? parseInt(value) : value;
                            })];
                    case 1:
                        parentNsRight = _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!(parentNsRight !== undefined)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.queryRunner.query("UPDATE " + tableName + " SET " +
                                (leftColumnName + " = CASE WHEN " + leftColumnName + " > " + parentNsRight + " THEN " + leftColumnName + " + 2 ELSE " + leftColumnName + " END,") +
                                (rightColumnName + " = " + rightColumnName + " + 2 ") +
                                ("WHERE " + rightColumnName + " >= " + parentNsRight))];
                    case 3:
                        _a.sent();
                        OrmUtils_1.OrmUtils.mergeDeep(subject.insertedValueSet, subject.metadata.nestedSetLeftColumn.createValueMap(parentNsRight), subject.metadata.nestedSetRightColumn.createValueMap(parentNsRight + 1));
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, this.isUniqueRootEntity(subject, parent)];
                    case 5:
                        isUniqueRoot = _a.sent();
                        // Validate if a root entity already exits and throw an exception
                        if (!isUniqueRoot)
                            throw new NestedSetMultipleRootError_1.NestedSetMultipleRootError();
                        OrmUtils_1.OrmUtils.mergeDeep(subject.insertedValueSet, subject.metadata.nestedSetLeftColumn.createValueMap(1), subject.metadata.nestedSetRightColumn.createValueMap(2));
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Executes operations when subject is being updated.
     */
    NestedSetSubjectExecutor.prototype.update = function (subject) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var parent, entity, oldParent, oldParentId, parentId, escape_1, tableName, leftColumnName, rightColumnName, entityId, entityNs, parentNs, isMovingUp, treeSize, entitySize, updateLeftSide, updateRightSide, isUniqueRoot;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        parent = subject.metadata.treeParentRelation.getEntityValue(subject.entity);
                        if (!parent && subject.parentSubject && subject.parentSubject.entity) // if entity was attached via children
                            parent = subject.parentSubject.entity;
                        entity = subject.databaseEntity;
                        if (!entity && parent) // if entity was attached via children
                            entity = subject.metadata.treeChildrenRelation.getEntityValue(parent).find(function (child) {
                                return Object.entries(subject.identifier).every(function (_a) {
                                    var _b = tslib_1.__read(_a, 2), key = _b[0], value = _b[1];
                                    return child[key] === value;
                                });
                            });
                        // Exit if the parent or the entity where never set
                        if (entity === undefined || parent === undefined) {
                            return [2 /*return*/];
                        }
                        oldParent = subject.metadata.treeParentRelation.getEntityValue(entity);
                        oldParentId = subject.metadata.getEntityIdMap(oldParent);
                        parentId = subject.metadata.getEntityIdMap(parent);
                        // Exit if the new and old parents are the same
                        if (OrmUtils_1.OrmUtils.compareIds(oldParentId, parentId)) {
                            return [2 /*return*/];
                        }
                        if (!parent) return [3 /*break*/, 9];
                        escape_1 = function (alias) { return _this.queryRunner.connection.driver.escape(alias); };
                        tableName = this.getTableName(subject.metadata.tablePath);
                        leftColumnName = escape_1(subject.metadata.nestedSetLeftColumn.databaseName);
                        rightColumnName = escape_1(subject.metadata.nestedSetRightColumn.databaseName);
                        entityId = subject.metadata.getEntityIdMap(entity);
                        entityNs = undefined;
                        if (!entityId) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getNestedSetIds(subject.metadata, entityId)];
                    case 1:
                        entityNs = (_a.sent())[0];
                        _a.label = 2;
                    case 2:
                        parentNs = undefined;
                        if (!parentId) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.getNestedSetIds(subject.metadata, parentId)];
                    case 3:
                        parentNs = (_a.sent())[0];
                        _a.label = 4;
                    case 4:
                        if (!(entityNs !== undefined && parentNs !== undefined)) return [3 /*break*/, 8];
                        isMovingUp = parentNs.left > entityNs.left;
                        treeSize = entityNs.right - entityNs.left + 1;
                        entitySize = void 0;
                        if (isMovingUp) {
                            entitySize = parentNs.left - entityNs.right;
                        }
                        else {
                            entitySize = parentNs.right - entityNs.left;
                        }
                        updateLeftSide = "WHEN " + leftColumnName + " >= " + entityNs.left + " AND " +
                            (leftColumnName + " < " + entityNs.right + " ") +
                            ("THEN " + leftColumnName + " + " + entitySize + " ");
                        updateRightSide = "WHEN " + rightColumnName + " > " + entityNs.left + " AND " +
                            (rightColumnName + " <= " + entityNs.right + " ") +
                            ("THEN " + rightColumnName + " + " + entitySize + " ");
                        if (!isMovingUp) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.queryRunner.query("UPDATE " + tableName + " " +
                                ("SET " + leftColumnName + " = CASE ") +
                                ("WHEN " + leftColumnName + " > " + entityNs.right + " AND ") +
                                (leftColumnName + " <= " + parentNs.left + " ") +
                                ("THEN " + leftColumnName + " - " + treeSize + " ") +
                                updateLeftSide +
                                ("ELSE " + leftColumnName + " ") +
                                "END, " +
                                (rightColumnName + " = CASE ") +
                                ("WHEN " + rightColumnName + " > " + entityNs.right + " AND ") +
                                (rightColumnName + " < " + parentNs.left + " ") +
                                ("THEN " + rightColumnName + " - " + treeSize + " ") +
                                updateRightSide +
                                ("ELSE " + rightColumnName + " ") +
                                "END")];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 6: return [4 /*yield*/, this.queryRunner.query("UPDATE " + tableName + " " +
                            ("SET " + leftColumnName + " = CASE ") +
                            ("WHEN " + leftColumnName + " < " + entityNs.left + " AND ") +
                            (leftColumnName + " > " + parentNs.right + " ") +
                            ("THEN " + leftColumnName + " + " + treeSize + " ") +
                            updateLeftSide +
                            ("ELSE " + leftColumnName + " ") +
                            "END, " +
                            (rightColumnName + " = CASE ") +
                            ("WHEN " + rightColumnName + " < " + entityNs.left + " AND ") +
                            (rightColumnName + " >= " + parentNs.right + " ") +
                            ("THEN " + rightColumnName + " + " + treeSize + " ") +
                            updateRightSide +
                            ("ELSE " + rightColumnName + " ") +
                            "END")];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8: return [3 /*break*/, 11];
                    case 9: return [4 /*yield*/, this.isUniqueRootEntity(subject, parent)];
                    case 10:
                        isUniqueRoot = _a.sent();
                        // Validate if a root entity already exits and throw an exception
                        if (!isUniqueRoot)
                            throw new NestedSetMultipleRootError_1.NestedSetMultipleRootError();
                        _a.label = 11;
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
    * Executes operations when subject is being removed.
    */
    NestedSetSubjectExecutor.prototype.remove = function (subjects) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var metadata, escape, tableName, leftColumnName, rightColumnName, entitiesIds, subjects_1, subjects_1_1, subject, entityId, entitiesNs, entitiesNs_1, entitiesNs_1_1, entity, treeSize, e_1_1;
            var e_2, _a, e_1, _b;
            var _this = this;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!Array.isArray(subjects))
                            subjects = [subjects];
                        metadata = subjects[0].metadata;
                        escape = function (alias) { return _this.queryRunner.connection.driver.escape(alias); };
                        tableName = this.getTableName(metadata.tablePath);
                        leftColumnName = escape(metadata.nestedSetLeftColumn.databaseName);
                        rightColumnName = escape(metadata.nestedSetRightColumn.databaseName);
                        entitiesIds = [];
                        try {
                            for (subjects_1 = tslib_1.__values(subjects), subjects_1_1 = subjects_1.next(); !subjects_1_1.done; subjects_1_1 = subjects_1.next()) {
                                subject = subjects_1_1.value;
                                entityId = metadata.getEntityIdMap(subject.entity);
                                if (entityId) {
                                    entitiesIds.push(entityId);
                                }
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (subjects_1_1 && !subjects_1_1.done && (_a = subjects_1.return)) _a.call(subjects_1);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                        return [4 /*yield*/, this.getNestedSetIds(metadata, entitiesIds)];
                    case 1:
                        entitiesNs = _c.sent();
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 7, 8, 9]);
                        entitiesNs_1 = tslib_1.__values(entitiesNs), entitiesNs_1_1 = entitiesNs_1.next();
                        _c.label = 3;
                    case 3:
                        if (!!entitiesNs_1_1.done) return [3 /*break*/, 6];
                        entity = entitiesNs_1_1.value;
                        treeSize = entity.right - entity.left + 1;
                        return [4 /*yield*/, this.queryRunner.query("UPDATE " + tableName + " " +
                                ("SET " + leftColumnName + " = CASE ") +
                                ("WHEN " + leftColumnName + " > " + entity.left + " THEN " + leftColumnName + " - " + treeSize + " ") +
                                ("ELSE " + leftColumnName + " ") +
                                "END, " +
                                (rightColumnName + " = CASE ") +
                                ("WHEN " + rightColumnName + " > " + entity.right + " THEN " + rightColumnName + " - " + treeSize + " ") +
                                ("ELSE " + rightColumnName + " ") +
                                "END")];
                    case 4:
                        _c.sent();
                        _c.label = 5;
                    case 5:
                        entitiesNs_1_1 = entitiesNs_1.next();
                        return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 9];
                    case 7:
                        e_1_1 = _c.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 9];
                    case 8:
                        try {
                            if (entitiesNs_1_1 && !entitiesNs_1_1.done && (_b = entitiesNs_1.return)) _b.call(entitiesNs_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get the nested set ids for a given entity
     */
    NestedSetSubjectExecutor.prototype.getNestedSetIds = function (metadata, ids) {
        var select = {
            left: metadata.targetName + "." + metadata.nestedSetLeftColumn.propertyPath,
            right: metadata.targetName + "." + metadata.nestedSetRightColumn.propertyPath
        };
        var queryBuilder = this.queryRunner.manager.createQueryBuilder();
        Object.entries(select).forEach(function (_a) {
            var _b = tslib_1.__read(_a, 2), key = _b[0], value = _b[1];
            queryBuilder.addSelect(value, key);
        });
        return queryBuilder
            .from(metadata.target, metadata.targetName)
            .whereInIds(ids)
            .orderBy(select.right, "DESC")
            .getRawMany()
            .then(function (results) {
            var e_3, _a, e_4, _b;
            var data = [];
            try {
                for (var results_1 = tslib_1.__values(results), results_1_1 = results_1.next(); !results_1_1.done; results_1_1 = results_1.next()) {
                    var result = results_1_1.value;
                    var entry = {};
                    try {
                        for (var _c = (e_4 = void 0, tslib_1.__values(Object.keys(select))), _d = _c.next(); !_d.done; _d = _c.next()) {
                            var key = _d.value;
                            var value = result ? result[key] : undefined;
                            // CockroachDB returns numeric types as string
                            entry[key] = typeof value === "string" ? parseInt(value) : value;
                        }
                    }
                    catch (e_4_1) { e_4 = { error: e_4_1 }; }
                    finally {
                        try {
                            if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                        }
                        finally { if (e_4) throw e_4.error; }
                    }
                    data.push(entry);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (results_1_1 && !results_1_1.done && (_a = results_1.return)) _a.call(results_1);
                }
                finally { if (e_3) throw e_3.error; }
            }
            return data;
        });
    };
    NestedSetSubjectExecutor.prototype.isUniqueRootEntity = function (subject, parent) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var escape, tableName, parameters, whereCondition, countAlias, result;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        escape = function (alias) { return _this.queryRunner.connection.driver.escape(alias); };
                        tableName = this.getTableName(subject.metadata.tablePath);
                        parameters = [];
                        whereCondition = subject.metadata.treeParentRelation.joinColumns.map(function (column) {
                            var columnName = escape(column.databaseName);
                            var parameter = column.getEntityValue(parent);
                            if (parameter == null) {
                                return columnName + " IS NULL";
                            }
                            parameters.push(parameter);
                            var parameterName = _this.queryRunner.connection.driver.createParameter("entity_" + column.databaseName, parameters.length - 1);
                            return columnName + " = " + parameterName;
                        }).join(" AND ");
                        countAlias = "count";
                        return [4 /*yield*/, this.queryRunner.query("SELECT COUNT(1) AS " + escape(countAlias) + " FROM " + tableName + " WHERE " + whereCondition, parameters)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, parseInt(result[0][countAlias]) === 0];
                }
            });
        });
    };
    /**
     * Gets escaped table name with schema name if SqlServer or Postgres driver used with custom
     * schema name, otherwise returns escaped table name.
     */
    NestedSetSubjectExecutor.prototype.getTableName = function (tablePath) {
        var _this = this;
        return tablePath.split(".")
            .map(function (i) {
            // this condition need because in SQL Server driver when custom database name was specified and schema name was not, we got `dbName..tableName` string, and doesn't need to escape middle empty string
            return i === "" ? i : _this.queryRunner.connection.driver.escape(i);
        }).join(".");
    };
    return NestedSetSubjectExecutor;
}());
exports.NestedSetSubjectExecutor = NestedSetSubjectExecutor;

//# sourceMappingURL=NestedSetSubjectExecutor.js.map
