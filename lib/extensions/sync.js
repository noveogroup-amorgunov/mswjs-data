"use strict";
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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
exports.__esModule = true;
exports.sync = void 0;
var env_1 = require("../utils/env");
function removeListeners(event, db) {
    var listeners = db.events.listeners(event);
    listeners.forEach(function (listener) {
        db.events.removeListener(event, listener);
    });
    return function () {
        listeners.forEach(function (listener) {
            db.events.addListener(event, listener);
        });
    };
}
/**
 * Synchronizes database operations across multiple clients.
 */
function sync(db) {
    if (!env_1.isBrowser() || !env_1.supports.broadcastChannel()) {
        return;
    }
    var channel = new BroadcastChannel('mswjs/data/sync');
    channel.addEventListener('message', function (event) {
        var _a = __read(event.data.payload, 1), sourceId = _a[0];
        // Ignore messages originating from unrelated databases.
        // Useful in case of multiple databases on the same page.
        if (db.id !== sourceId) {
            return;
        }
        // Remove database event listener for the signaled operation
        // to prevent an infinite loop when applying this operation.
        var restoreListeners = removeListeners(event.data.operationType, db);
        // Apply the database operation signaled from another client
        // to the current database instance.
        switch (event.data.operationType) {
            case 'create': {
                var _b = __read(event.data.payload[1], 3), modelName = _b[0], entity = _b[1], customPrimaryKey = _b[2];
                db.create(modelName, db.deserializeEntity(entity), customPrimaryKey);
                break;
            }
            case 'update': {
                var _c = __read(event.data.payload[1], 3), modelName = _c[0], prevEntity = _c[1], nextEntity = _c[2];
                db.update(modelName, db.deserializeEntity(prevEntity), db.deserializeEntity(nextEntity));
                break;
            }
            default: {
                db[event.data.operationType].apply(db, __spreadArray([], __read(event.data.payload[1])));
            }
        }
        // Re-attach database event listeners.
        restoreListeners();
    });
    // Broadcast the emitted event from this client
    // to all the other connected clients.
    function broadcastDatabaseEvent(operationType) {
        return function () {
            var payload = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                payload[_i] = arguments[_i];
            }
            channel.postMessage({
                operationType: operationType,
                payload: payload
            });
        };
    }
    db.events.on('create', broadcastDatabaseEvent('create'));
    db.events.on('update', broadcastDatabaseEvent('update'));
    db.events.on('delete', broadcastDatabaseEvent('delete'));
}
exports.sync = sync;
