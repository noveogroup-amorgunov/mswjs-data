"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.generateRestHandlers = exports.parseQueryParams = exports.withErrors = exports.getResponseStatusByErrorType = exports.createUrlBuilder = void 0;
var pluralize_1 = __importDefault(require("pluralize"));
var msw_1 = require("msw");
var OperationError_1 = require("../errors/OperationError");
var findPrimaryKey_1 = require("../utils/findPrimaryKey");
var HTTPErrorType;
(function (HTTPErrorType) {
    HTTPErrorType[HTTPErrorType["BadRequest"] = 0] = "BadRequest";
})(HTTPErrorType || (HTTPErrorType = {}));
var ErrorType = __assign(__assign({}, HTTPErrorType), OperationError_1.OperationErrorType);
var HTTPError = /** @class */ (function (_super) {
    __extends(HTTPError, _super);
    function HTTPError(type, message) {
        var _this = _super.call(this, type, message) || this;
        _this.name = 'HTTPError';
        return _this;
    }
    return HTTPError;
}(OperationError_1.OperationError));
function createUrlBuilder(baseUrl) {
    return function (path) {
        // For the previous implementation trailing slash didn't matter, we must keep it this way for backward compatibility
        var normalizedBaseUrl = baseUrl && baseUrl.slice(-1) === '/' ? baseUrl.slice(0, -1) : baseUrl || '';
        return normalizedBaseUrl + "/" + path;
    };
}
exports.createUrlBuilder = createUrlBuilder;
function getResponseStatusByErrorType(error) {
    switch (error.type) {
        case ErrorType.EntityNotFound:
            return 404;
        case ErrorType.DuplicatePrimaryKey:
            return 409;
        case ErrorType.BadRequest:
            return 400;
        default:
            return 500;
    }
}
exports.getResponseStatusByErrorType = getResponseStatusByErrorType;
function withErrors(handler) {
    return function (req, res, ctx) {
        try {
            return handler(req, res, ctx);
        }
        catch (error) {
            return res(ctx.status(getResponseStatusByErrorType(error)), ctx.json({
                message: error.message
            }));
        }
    };
}
exports.withErrors = withErrors;
function parseQueryParams(modelName, definition, searchParams) {
    var paginationKeys = ['cursor', 'skip', 'take'];
    var cursor = searchParams.get('cursor');
    var rawSkip = searchParams.get('skip');
    var rawTake = searchParams.get('take');
    var filters = {};
    var skip = rawSkip == null ? rawSkip : parseInt(rawSkip, 10);
    var take = rawTake == null ? rawTake : parseInt(rawTake, 10);
    searchParams.forEach(function (value, key) {
        if (paginationKeys.includes(key)) {
            return;
        }
        if (definition[key]) {
            filters[key] = {
                equals: value
            };
        }
        else {
            throw new HTTPError(HTTPErrorType.BadRequest, "Failed to query the \"" + modelName + "\" model: unknown property \"" + key + "\".");
        }
    });
    return {
        cursor: cursor,
        skip: skip,
        take: take,
        filters: filters
    };
}
exports.parseQueryParams = parseQueryParams;
function generateRestHandlers(modelName, modelDefinition, model, baseUrl) {
    if (baseUrl === void 0) { baseUrl = ''; }
    var primaryKey = findPrimaryKey_1.findPrimaryKey(modelDefinition);
    var primaryKeyValue = modelDefinition[primaryKey].getPrimaryKeyValue();
    var modelPath = pluralize_1["default"](modelName);
    var buildUrl = createUrlBuilder(baseUrl);
    function extractPrimaryKey(params) {
        var parameterValue = params[primaryKey];
        return typeof primaryKeyValue === 'number'
            ? Number(parameterValue)
            : parameterValue;
    }
    return [
        msw_1.rest.get(buildUrl(modelPath), withErrors(function (req, res, ctx) {
            var _a = parseQueryParams(modelName, modelDefinition, req.url.searchParams), skip = _a.skip, take = _a.take, cursor = _a.cursor, filters = _a.filters;
            var options = { where: filters };
            if (take || skip) {
                options = Object.assign(options, { take: take, skip: skip });
            }
            if (take || cursor) {
                options = Object.assign(options, { take: take, cursor: cursor });
            }
            var records = model.findMany(options);
            return res(ctx.json(records));
        })),
        msw_1.rest.get(buildUrl(modelPath + "/:" + primaryKey), withErrors(function (req, res, ctx) {
            var _a;
            var id = extractPrimaryKey(req.params);
            var where = (_a = {},
                _a[primaryKey] = {
                    equals: id
                },
                _a);
            var entity = model.findFirst({
                strict: true,
                where: where
            });
            return res(ctx.json(entity));
        })),
        msw_1.rest.post(buildUrl(modelPath), withErrors(function (req, res, ctx) {
            var createdEntity = model.create(req.body);
            return res(ctx.status(201), ctx.json(createdEntity));
        })),
        msw_1.rest.put(buildUrl(modelPath + "/:" + primaryKey), withErrors(function (req, res, ctx) {
            var _a;
            var id = extractPrimaryKey(req.params);
            var where = (_a = {},
                _a[primaryKey] = {
                    equals: id
                },
                _a);
            var updatedEntity = model.update({
                strict: true,
                where: where,
                data: req.body
            });
            return res(ctx.json(updatedEntity));
        })),
        msw_1.rest["delete"](buildUrl(modelPath + "/:" + primaryKey), withErrors(function (req, res, ctx) {
            var _a;
            var id = extractPrimaryKey(req.params);
            var where = (_a = {},
                _a[primaryKey] = {
                    equals: id
                },
                _a);
            var deletedEntity = model["delete"]({
                strict: true,
                where: where
            });
            return res(ctx.json(deletedEntity));
        })),
    ];
}
exports.generateRestHandlers = generateRestHandlers;
