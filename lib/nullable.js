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
exports.__esModule = true;
exports.nullable = exports.NullableProperty = void 0;
var Relation_1 = require("./relations/Relation");
var NullableProperty = /** @class */ (function () {
    function NullableProperty(getter) {
        this.getValue = getter;
    }
    return NullableProperty;
}());
exports.NullableProperty = NullableProperty;
function nullable(value) {
    if (typeof value === 'function') {
        return new NullableProperty(value);
    }
    return new Relation_1.Relation({
        kind: value.kind,
        to: value.target.modelName,
        attributes: __assign(__assign({}, value.attributes), { nullable: true })
    });
}
exports.nullable = nullable;
