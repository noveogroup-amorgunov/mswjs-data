"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.Database = exports.SERIALIZED_INTERNAL_PROPERTIES_KEY = void 0;
var md5_1 = __importDefault(require("md5"));
var outvariant_1 = require("outvariant");
var strict_event_emitter_1 = require("strict-event-emitter");
var glossary_1 = require("../glossary");
var inheritInternalProperties_1 = require("../utils/inheritInternalProperties");
exports.SERIALIZED_INTERNAL_PROPERTIES_KEY = 'SERIALIZED_INTERNAL_PROPERTIES';
var callOrder = 0;
var Database = /** @class */ (function () {
    function Database(dictionary) {
        this.events = new strict_event_emitter_1.StrictEventEmitter();
        this.models = Object.keys(dictionary).reduce(function (acc, modelName) {
            acc[modelName] = new Map();
            return acc;
        }, {});
        callOrder++;
        this.id = this.generateId();
    }
    /**
     * Generates a unique MD5 hash based on the database
     * module location and invocation order. Used to reproducibly
     * identify a database instance among sibling instances.
     */
    Database.prototype.generateId = function () {
        var stack = new Error().stack;
        var callFrame = stack === null || stack === void 0 ? void 0 : stack.split('\n')[4];
        var salt = callOrder + "-" + (callFrame === null || callFrame === void 0 ? void 0 : callFrame.trim());
        return md5_1["default"](salt);
    };
    /**
     * Sets the serialized internal properties as symbols
     * on the given entity.
     * @note `Symbol` properties are stripped off when sending
     * an object over an event emitter.
     */
    Database.prototype.deserializeEntity = function (entity) {
        var _a;
        var _b = entity, _c = exports.SERIALIZED_INTERNAL_PROPERTIES_KEY, internalProperties = _b[_c], publicProperties = __rest(_b, [typeof _c === "symbol" ? _c : _c + ""]);
        inheritInternalProperties_1.inheritInternalProperties(publicProperties, (_a = {},
            _a[glossary_1.ENTITY_TYPE] = internalProperties.entityType,
            _a[glossary_1.PRIMARY_KEY] = internalProperties.primaryKey,
            _a));
        return publicProperties;
    };
    Database.prototype.serializeEntity = function (entity) {
        var _a;
        return __assign(__assign({}, entity), (_a = {}, _a[exports.SERIALIZED_INTERNAL_PROPERTIES_KEY] = {
            entityType: entity[glossary_1.ENTITY_TYPE],
            primaryKey: entity[glossary_1.PRIMARY_KEY]
        }, _a));
    };
    Database.prototype.hydrate = function (data) {
        var _this = this;
        Object.entries(data).forEach(function (_a) {
            var e_1, _b;
            var _c = __read(_a, 2), modelName = _c[0], entities = _c[1];
            try {
                for (var _d = __values(entities.entries()), _e = _d.next(); !_e.done; _e = _d.next()) {
                    var _f = __read(_e.value, 2), entity = _f[1];
                    _this.create(modelName, _this.deserializeEntity(entity));
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_e && !_e.done && (_b = _d["return"])) _b.call(_d);
                }
                finally { if (e_1) throw e_1.error; }
            }
        });
    };
    Database.prototype.toJson = function () {
        var _this = this;
        return Object.entries(this.models).reduce(function (json, _a) {
            var e_2, _b;
            var _c = __read(_a, 2), modelName = _c[0], entities = _c[1];
            var modelJson = [];
            try {
                for (var _d = __values(entities.entries()), _e = _d.next(); !_e.done; _e = _d.next()) {
                    var _f = __read(_e.value, 2), entity = _f[1];
                    modelJson.push(_this.serializeEntity(entity));
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_e && !_e.done && (_b = _d["return"])) _b.call(_d);
                }
                finally { if (e_2) throw e_2.error; }
            }
            json[modelName] = modelJson;
            return json;
        }, {});
    };
    Database.prototype.getModel = function (name) {
        return this.models[name];
    };
    Database.prototype.create = function (modelName, entity, customPrimaryKey) {
        outvariant_1.invariant(entity[glossary_1.ENTITY_TYPE], 'Failed to create a new "%s" record: provided entity has no type. %j', modelName, entity);
        outvariant_1.invariant(entity[glossary_1.PRIMARY_KEY], 'Failed to create a new "%s" record: provided entity has no primary key. %j', modelName, entity);
        var primaryKey = customPrimaryKey || entity[entity[glossary_1.PRIMARY_KEY]];
        this.events.emit('create', this.id, [
            modelName,
            this.serializeEntity(entity),
            customPrimaryKey,
        ]);
        return this.getModel(modelName).set(primaryKey, entity);
    };
    Database.prototype.update = function (modelName, prevEntity, nextEntity) {
        var prevPrimaryKey = prevEntity[prevEntity[glossary_1.PRIMARY_KEY]];
        var nextPrimaryKey = nextEntity[prevEntity[glossary_1.PRIMARY_KEY]];
        if (nextPrimaryKey !== prevPrimaryKey) {
            this["delete"](modelName, prevPrimaryKey);
        }
        this.getModel(modelName).set(nextPrimaryKey, nextEntity);
        // this.create(modelName, nextEntity, nextPrimaryKey)
        this.events.emit('update', this.id, [
            modelName,
            this.serializeEntity(prevEntity),
            this.serializeEntity(nextEntity),
        ]);
    };
    Database.prototype["delete"] = function (modelName, primaryKey) {
        this.getModel(modelName)["delete"](primaryKey);
        this.events.emit('delete', this.id, [modelName, primaryKey]);
    };
    Database.prototype.has = function (modelName, primaryKey) {
        return this.getModel(modelName).has(primaryKey);
    };
    Database.prototype.count = function (modelName) {
        return this.getModel(modelName).size;
    };
    Database.prototype.listEntities = function (modelName) {
        return Array.from(this.getModel(modelName).values());
    };
    return Database;
}());
exports.Database = Database;
