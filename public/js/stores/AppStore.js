var AppDispatcher = require('../dispatcher/AppDispatcher');
var AppConstants = require('../constants/AppConstants');
var EventEmitter2 = require('eventemitter2').EventEmitter2;
var cli = require('caf_cli');
var json_rpc = require('caf_transport').json_rpc;
var crypto = require('crypto');

var CHANGE_EVENT = 'change';

var DEFAULT_CURRENT = {url: 'blank.html', target: null};

var newAppStore = function() {

    var server = new EventEmitter2();

    var invCacheCounter = 0;

    var state = {
        apps :{},
        current: DEFAULT_CURRENT,
        login: null,
        notif :[],
        cacheKeys : {},
        isClosed: false
    };

    var that = {};

    var emitChange = function() {
        server.emit(CHANGE_EVENT);
    };

    that.addChangeListener = function(callback) {
        server.on(CHANGE_EVENT, callback);
    };

    that.removeChangeListener = function(callback) {
        server.removeListener(CHANGE_EVENT, callback);
    };

    that.getState = function() {
        return state;
    };

    var mixinState = function(newState) {
        Object.keys(newState)
            .forEach(function(key) { state[key] = newState[key]; });
    };

    var updateIFrame = function() {
        if (state.current.pending &&
            (state.current.target !== state.current.pending) &&
            (state.apps[state.current.pending])) {
            // we always delay url update until we have a token.
            var split = json_rpc.splitName(state.current.pending,
                                           json_rpc.APP_SEPARATOR);
            var app = json_rpc.splitName(split[0]);
            var ca = json_rpc.splitName(split[1]);

            var cacheKey = state.cacheKeys[state.current.pending];
            if (!cacheKey) {
                cacheKey = new Buffer(crypto.randomBytes(15))
                    .toString('base64');
                state.cacheKeys[state.current.pending] = cacheKey;
            }
            var options = {
                appPublisher: app[0],
                appLocalName: app[1],
                caOwner: ca[0],
                caLocalName: ca[1],
                token: state.apps[state.current.pending],
                cacheKey: cacheKey
            };

            // mostly for demo
            if (state.disableCache) {
                options.cacheKey = invCacheCounter;
                invCacheCounter = invCacheCounter + 1;
            }

            var url = cli.patchURL(window.location.href, options);
            state.current = {url: url, target: state.current.pending};
        }
    };

    var f = function(action) {
        switch(action.actionType) {
        case AppConstants.APP_UPDATE:
            mixinState(action.state);
            updateIFrame();
            emitChange();
            break;
        case AppConstants.APP_ERROR:
            state.error = action.error;
            console.log('Error:' + action.error);
            emitChange();
            break;
        case AppConstants.WS_STATUS:
            state.isClosed = action.isClosed;
            emitChange();
            break;
        default:
            console.log('Ignoring '+ JSON.stringify(action));
        }
    };

    AppDispatcher.register(f);
    return that;
};

module.exports = newAppStore();
