"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.persist = void 0;
var debounce_1 = __importDefault(require("lodash/debounce"));
var glossary_1 = require("../glossary");
var env_1 = require("../utils/env");
var STORAGE_KEY_PREFIX = 'mswjs-data';
// Timout to persist state with some delay
var DEBOUNCE_PERSIST_TIME_MS = 10;
/**
 * Persist database in session storage
 */
function persist(factory, options) {
    if (options === void 0) { options = {}; }
    if (!env_1.isBrowser() || (!options.storage && !env_1.supports.sessionStorage())) {
        return;
    }
    var storage = options.storage || sessionStorage;
    var keyPrefix = options.keyPrefix || STORAGE_KEY_PREFIX;
    var db = factory[glossary_1.DATABASE_INSTANCE];
    var key = keyPrefix + "/" + db.id;
    var persistState = debounce_1["default"](function persistState() {
        var json = db.toJson();
        storage.setItem(key, JSON.stringify(json));
    }, DEBOUNCE_PERSIST_TIME_MS);
    function hydrateState() {
        var initialState = storage.getItem(key);
        if (initialState) {
            db.hydrate(JSON.parse(initialState));
        }
        // Add event listeners only after hydration
        db.events.on('create', persistState);
        db.events.on('update', persistState);
        db.events.on('delete', persistState);
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hydrateState);
    }
    else {
        hydrateState();
    }
}
exports.persist = persist;
