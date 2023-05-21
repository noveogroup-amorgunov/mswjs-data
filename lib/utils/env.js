"use strict";
exports.__esModule = true;
exports.supports = exports.isBrowser = void 0;
function isBrowser() {
    return typeof window !== 'undefined';
}
exports.isBrowser = isBrowser;
exports.supports = {
    sessionStorage: function () {
        return typeof sessionStorage !== 'undefined';
    },
    broadcastChannel: function () {
        return typeof BroadcastChannel !== 'undefined';
    }
};
