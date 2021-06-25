import { __read, __spreadArray, __values } from "tslib";
import { hash, shorten } from "../util/StringUtils";
/**
 * Common driver utility functions.
 */
var DriverUtils = /** @class */ (function () {
    function DriverUtils() {
    }
    // -------------------------------------------------------------------------
    // Public Static Methods
    // -------------------------------------------------------------------------
    /**
     * Normalizes and builds a new driver options.
     * Extracts settings from connection url and sets to a new options object.
     */
    DriverUtils.buildDriverOptions = function (options, buildOptions) {
        var e_1, _a;
        if (options.url) {
            var urlDriverOptions = this.parseConnectionUrl(options.url);
            if (buildOptions && buildOptions.useSid && urlDriverOptions.database) {
                urlDriverOptions.sid = urlDriverOptions.database;
            }
            try {
                for (var _b = __values(Object.keys(urlDriverOptions)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var key = _c.value;
                    if (typeof urlDriverOptions[key] === "undefined") {
                        delete urlDriverOptions[key];
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return Object.assign({}, options, urlDriverOptions);
        }
        return Object.assign({}, options);
    };
    /**
     * buildDriverOptions for MongodDB only to support replica set
     */
    DriverUtils.buildMongoDBDriverOptions = function (options, buildOptions) {
        var e_2, _a;
        if (options.url) {
            var urlDriverOptions = this.parseMongoDBConnectionUrl(options.url);
            if (buildOptions && buildOptions.useSid && urlDriverOptions.database) {
                urlDriverOptions.sid = urlDriverOptions.database;
            }
            try {
                for (var _b = __values(Object.keys(urlDriverOptions)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var key = _c.value;
                    if (typeof urlDriverOptions[key] === "undefined") {
                        delete urlDriverOptions[key];
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return Object.assign({}, options, urlDriverOptions);
        }
        return Object.assign({}, options);
    };
    /**
     * Joins and shortens alias if needed.
     *
     * If the alias length is greater than the limit allowed by the current
     * driver, replaces it with a shortend string, if the shortend string
     * is still too long, it will then hash the alias.
     *
     * @param driver Current `Driver`.
     * @param buildOptions Optional settings.
     * @param alias Alias parts.
     *
     * @return An alias that is no longer than the divers max alias length.
     */
    DriverUtils.buildAlias = function (_a, buildOptions) {
        var maxAliasLength = _a.maxAliasLength;
        var alias = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            alias[_i - 2] = arguments[_i];
        }
        if (typeof buildOptions === "string") {
            alias.unshift(buildOptions);
            buildOptions = { shorten: false, joiner: "_" };
        }
        else {
            buildOptions = Object.assign({ shorten: false, joiner: "_" }, buildOptions);
        }
        var newAlias = alias.length === 1 ? alias[0] : alias.join(buildOptions.joiner);
        if (maxAliasLength && maxAliasLength > 0 && newAlias.length > maxAliasLength) {
            if (buildOptions.shorten === true) {
                var shortenedAlias = shorten(newAlias);
                if (shortenedAlias.length < maxAliasLength) {
                    return shortenedAlias;
                }
            }
            return hash(newAlias, { length: maxAliasLength });
        }
        return newAlias;
    };
    /**
     * @deprecated use `buildAlias` instead.
     */
    DriverUtils.buildColumnAlias = function (_a, buildOptions) {
        var maxAliasLength = _a.maxAliasLength;
        var alias = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            alias[_i - 2] = arguments[_i];
        }
        return this.buildAlias.apply(this, __spreadArray([{ maxAliasLength: maxAliasLength }, buildOptions], __read(alias)));
    };
    // -------------------------------------------------------------------------
    // Private Static Methods
    // -------------------------------------------------------------------------
    /**
     * Extracts connection data from the connection url.
     */
    DriverUtils.parseConnectionUrl = function (url) {
        var type = url.split(":")[0];
        var firstSlashes = url.indexOf("//");
        var preBase = url.substr(firstSlashes + 2);
        var secondSlash = preBase.indexOf("/");
        var base = (secondSlash !== -1) ? preBase.substr(0, secondSlash) : preBase;
        var afterBase = (secondSlash !== -1) ? preBase.substr(secondSlash + 1) : undefined;
        // remove mongodb query params
        if (afterBase && afterBase.indexOf("?") !== -1) {
            afterBase = afterBase.substr(0, afterBase.indexOf("?"));
        }
        var lastAtSign = base.lastIndexOf("@");
        var usernameAndPassword = base.substr(0, lastAtSign);
        var hostAndPort = base.substr(lastAtSign + 1);
        var username = usernameAndPassword;
        var password = "";
        var firstColon = usernameAndPassword.indexOf(":");
        if (firstColon !== -1) {
            username = usernameAndPassword.substr(0, firstColon);
            password = usernameAndPassword.substr(firstColon + 1);
        }
        var _a = __read(hostAndPort.split(":"), 2), host = _a[0], port = _a[1];
        return {
            type: type,
            host: host,
            username: decodeURIComponent(username),
            password: decodeURIComponent(password),
            port: port ? parseInt(port) : undefined,
            database: afterBase || undefined
        };
    };
    /**
     * Extracts connection data from the connection url for MongoDB to support replica set.
     */
    DriverUtils.parseMongoDBConnectionUrl = function (url) {
        var _a, e_3, _b;
        var type = url.split(":")[0];
        var firstSlashes = url.indexOf("//");
        var preBase = url.substr(firstSlashes + 2);
        var secondSlash = preBase.indexOf("/");
        var base = (secondSlash !== -1) ? preBase.substr(0, secondSlash) : preBase;
        var afterBase = (secondSlash !== -1) ? preBase.substr(secondSlash + 1) : undefined;
        var afterQuestionMark = "";
        var host = undefined;
        var port = undefined;
        var hostReplicaSet = undefined;
        var replicaSet = undefined;
        var optionsObject = {};
        if (afterBase && afterBase.indexOf("?") !== -1) {
            // split params
            afterQuestionMark = afterBase.substr((afterBase.indexOf("?") + 1), afterBase.length);
            var optionsList = afterQuestionMark.split("&");
            var optionKey_1;
            var optionValue_1;
            // create optionsObject for merge with connectionUrl object before return
            optionsList.forEach(function (optionItem) {
                optionKey_1 = optionItem.split("=")[0];
                optionValue_1 = optionItem.split("=")[1];
                optionsObject[optionKey_1] = optionValue_1;
            });
            // specific replicaSet value to set options about hostReplicaSet
            replicaSet = optionsObject["replicaSet"];
            afterBase = afterBase.substr(0, afterBase.indexOf("?"));
        }
        var lastAtSign = base.lastIndexOf("@");
        var usernameAndPassword = base.substr(0, lastAtSign);
        var hostAndPort = base.substr(lastAtSign + 1);
        var username = usernameAndPassword;
        var password = "";
        var firstColon = usernameAndPassword.indexOf(":");
        if (firstColon !== -1) {
            username = usernameAndPassword.substr(0, firstColon);
            password = usernameAndPassword.substr(firstColon + 1);
        }
        // If replicaSet have value set It as hostlist, If not set like standalone host
        if (replicaSet) {
            hostReplicaSet = hostAndPort;
        }
        else {
            _a = __read(hostAndPort.split(":"), 2), host = _a[0], port = _a[1];
        }
        var connectionUrl = {
            type: type,
            host: host,
            hostReplicaSet: hostReplicaSet,
            username: decodeURIComponent(username),
            password: decodeURIComponent(password),
            port: port ? parseInt(port) : undefined,
            database: afterBase || undefined
        };
        try {
            // Loop to set every options in connectionUrl to object
            for (var _c = __values(Object.entries(optionsObject)), _d = _c.next(); !_d.done; _d = _c.next()) {
                var _e = __read(_d.value, 2), key = _e[0], value = _e[1];
                connectionUrl[key] = value;
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return connectionUrl;
    };
    return DriverUtils;
}());
export { DriverUtils };

//# sourceMappingURL=DriverUtils.js.map
