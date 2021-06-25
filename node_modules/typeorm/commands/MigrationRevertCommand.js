"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationRevertCommand = void 0;
var tslib_1 = require("tslib");
var index_1 = require("../index");
var ConnectionOptionsReader_1 = require("../connection/ConnectionOptionsReader");
var chalk_1 = tslib_1.__importDefault(require("chalk"));
/**
 * Reverts last migration command.
 */
var MigrationRevertCommand = /** @class */ (function () {
    function MigrationRevertCommand() {
        this.command = "migration:revert";
        this.describe = "Reverts last executed migration.";
        this.aliases = "migrations:revert";
    }
    MigrationRevertCommand.prototype.builder = function (args) {
        return args
            .option("c", {
            alias: "connection",
            default: "default",
            describe: "Name of the connection on which run a query."
        })
            .option("transaction", {
            alias: "t",
            default: "default",
            describe: "Indicates if transaction should be used or not for migration revert. Enabled by default."
        })
            .option("f", {
            alias: "config",
            default: "ormconfig",
            describe: "Name of the file with connection configuration."
        });
    };
    MigrationRevertCommand.prototype.handler = function (args) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var connection, connectionOptionsReader, connectionOptions, options, err_1;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (args._[0] === "migrations:revert") {
                            console.log("'migrations:revert' is deprecated, please use 'migration:revert' instead");
                        }
                        connection = undefined;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, , 9]);
                        connectionOptionsReader = new ConnectionOptionsReader_1.ConnectionOptionsReader({
                            root: process.cwd(),
                            configName: args.config
                        });
                        return [4 /*yield*/, connectionOptionsReader.get(args.connection)];
                    case 2:
                        connectionOptions = _b.sent();
                        Object.assign(connectionOptions, {
                            subscribers: [],
                            synchronize: false,
                            migrationsRun: false,
                            dropSchema: false,
                            logging: ["query", "error", "schema"]
                        });
                        return [4 /*yield*/, index_1.createConnection(connectionOptions)];
                    case 3:
                        connection = _b.sent();
                        options = {
                            transaction: (_a = connectionOptions.migrationsTransactionMode) !== null && _a !== void 0 ? _a : "all",
                        };
                        switch (args.t) {
                            case "all":
                                options.transaction = "all";
                                break;
                            case "none":
                            case "false":
                                options.transaction = "none";
                                break;
                            case "each":
                                options.transaction = "each";
                                break;
                            default:
                            // noop
                        }
                        return [4 /*yield*/, connection.undoLastMigration(options)];
                    case 4:
                        _b.sent();
                        return [4 /*yield*/, connection.close()];
                    case 5:
                        _b.sent();
                        return [3 /*break*/, 9];
                    case 6:
                        err_1 = _b.sent();
                        if (!connection) return [3 /*break*/, 8];
                        return [4 /*yield*/, connection.close()];
                    case 7:
                        _b.sent();
                        _b.label = 8;
                    case 8:
                        console.log(chalk_1.default.black.bgRed("Error during migration revert:"));
                        console.error(err_1);
                        process.exit(1);
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    return MigrationRevertCommand;
}());
exports.MigrationRevertCommand = MigrationRevertCommand;

//# sourceMappingURL=MigrationRevertCommand.js.map
