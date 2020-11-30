"use strict";

var AppConstants = require('../constants/AppConstants');
var json_rpc = require('caf_transport').json_rpc;

var DEAD_PAGE = '<!DOCTYPE html> \
<html> \
  <head> \
    <title>Cloud Assistant Framework</title> \
  </head> \
  <body> \
    <h1> Launcher App Lost Connection, Please Reload</h1> \
  </body> \
</html>';

// after (new Buffer(DEAD_PAGE)).toString('base64')
var DEAD_PAGE_BASE64 = 'PCFET0NUWVBFIGh0bWw+IDxodG1sPiAgIDxoZWFkPiAgICAgPHRpdGxlPkNsb3VkIEFzc2lzdGFudCBGcmFtZXdvcms8L3RpdGxlPiAgIDwvaGVhZD4gICA8Ym9keT4gICAgIDxoMT4gTGF1bmNoZXIgQXBwIExvc3QgQ29ubmVjdGlvbiwgUGxlYXNlIFJlbG9hZDwvaDE+ICAgPC9ib2R5PiA8L2h0bWw+';

var updateF = function(store, state) {
    var d = {
        type: AppConstants.APP_UPDATE,
        state: state
    };
    store.dispatch(d);
};


var errorF =  function(store, err) {
    var d = {
        type: AppConstants.APP_ERROR,
        error: err
    };
    store.dispatch(d);
};

var getNotifData = function(msg) {
    return json_rpc.getMethodArgs(msg)[0];
};

var notifyF = function(store, message) {
    var d = {
        type: AppConstants.APP_NOTIFICATION,
        state: getNotifData(message)
    };
    store.dispatch(d);
};

var wsStatusF =  function(store, isClosed) {
    var d = {
        type: AppConstants.WS_STATUS,
        isClosed: isClosed
    };
    store.dispatch(d);
};


var AppActions = {
    async init(ctx) {
        try {
            var data = await ctx.session.hello(ctx.token).getPromise();
            updateF(ctx.store, data);
        } catch (err) {
            errorF(ctx.store, err);
        }
    },

    message(ctx, msg) {
        notifyF(ctx.store, msg);
    },
    closing(ctx, err) {
        console.log('Closing:' + JSON.stringify(err));
        wsStatusF(ctx.store, true);
    },
    disableCache(ctx, value) {
        updateF(ctx.store, {disableCache: value});
    },
    setCurrent(ctx, newCurrent) {
        newCurrent = (newCurrent === null ? {url: 'blank.html', target: null} :
                      newCurrent);
        updateF(ctx.store, {current: newCurrent});
    },
    changeRemoveModal(ctx, current, isOpen) {
        current = (current === null ? {url: 'blank.html', target: null} :
                   current);
        current.removeModal = isOpen;
        AppActions.setCurrent(ctx, current);
    },
    changeAddModal(ctx, current, isOpen) {
        current = (current === null ? {url: 'blank.html', target: null} :
                   current);

        current.addModal = isOpen;
        AppActions.setCurrent(ctx, current);
    },
    changeRegisterModal(ctx, isOpen) {
        updateF(ctx.store, {register: isOpen});
    },
    changeUnregisterModal(ctx, isOpen) {
        updateF(ctx.store, {unregister: isOpen});
    },
    dead(ctx) {
        var current = {url: 'data:text/html;charset=utf-8;base64,' +
                       DEAD_PAGE_BASE64, target: null};
        setTimeout(function() {
            AppActions.setCurrent(ctx, current);
        }, 0);
    },
    resetError(ctx) {
        errorF(ctx.store, null);
    },
    setError(ctx, err) {
        errorF(ctx.store, err);
    },
    setLocalState(ctx, data) {
        updateF(ctx.store, data);
    }
};

['addApp', 'removeApp', 'registerApp', 'getDaysPerUnit', 'unregisterApp',
 'setMegaToken', 'setCacheKey', 'refreshTokens',
 'getAppCost'].forEach(function(x) {
     AppActions[x] = async function() {
         try {
             var args = Array.prototype.slice.call(arguments);
             var ctx = args.shift();
             var data = await ctx.session[x].apply(ctx.session, args)
                     .getPromise();
             updateF(ctx.store, data);
         } catch (err) {
             errorF(ctx.store, err);
         }
     };
 });

module.exports = AppActions;
