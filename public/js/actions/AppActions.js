var cli = require('caf_cli');
var AppDispatcher = require('../dispatcher/AppDispatcher');
var AppConstants = require('../constants/AppConstants');

var json_rpc = require('caf_transport').json_rpc;
var urlParser = require('url');
var querystring =  require('querystring');

var updateF = function(state) {
    var d = {
        actionType: AppConstants.APP_UPDATE,
        state: state
    };
    AppDispatcher.dispatch(d);
};


var errorF =  function(err) {
    var d = {
        actionType: AppConstants.APP_ERROR,
        error: err
    };
    AppDispatcher.dispatch(d);
};

var getNotifData = function(msg) {
    return json_rpc.getMethodArgs(msg)[0];
};

var notifyF = function(message) {
    var d = {
        actionType: AppConstants.APP_NOTIFICATION,
        state: getNotifData(message)
    };
    AppDispatcher.dispatch(d);
};

var wsStatusF =  function(isClosed) {
    var d = {
        actionType: AppConstants.WS_STATUS,
        isClosed: isClosed
    };
    AppDispatcher.dispatch(d);
};

var extractTokenFromURL = function() {
    var url = urlParser.parse(window.location.href);
    if (url.hash) {
        return querystring.parse(url.hash.slice(1)).token;
    } else {
        return null;
    }
};



var AppActions = {};

AppActions.initSession = function(caOwner, caLocalName) {

    window.location.href = cli.patchURL(window.location.href, {
                                            caOwner: caOwner,
                                            caLocalName: caLocalName
                                        });
    var AppSession = require('../session/AppSession');

    ['addApp', 'removeApp', 'setMegaToken', 'refreshTokens']
        .forEach(function(x) {
                     AppActions[x] = function() {
                         var args = Array.prototype.slice.call(arguments);
                         args.push(function(err, data) {
                                       if (err) {
                                           errorF(err);
                                       } else {
                                           updateF({apps: data});
                                       }
                                   });
                         AppSession[x].apply(AppSession, args);
                     };
                 });

    AppSession.onmessage = function(msg) {
        console.log('message:' + JSON.stringify(msg));
        notifyF(msg);
    };

    AppSession.onclose = function(err) {
        console.log('Closing:' + JSON.stringify(err));
        wsStatusF(true);
    };

    AppSession.onopen = function() {
        console.log('open session');
        AppActions.init();
    };
};



AppActions.init = function(data) {
    if (typeof window === 'undefined') {
        // server side rendering
        updateF({apps: data});
    } else {
        var megaToken = extractTokenFromURL();
        if (megaToken) {
            AppActions.setMegaToken(megaToken);
        } else {
            AppActions.refreshTokens();
        }
    }
};

AppActions.resetError =  function() {
    errorF(null);
};

AppActions.login = function(caOwner, caLocalName) {
    if (caOwner && caLocalName) {
        AppActions.initSession(caOwner, caLocalName);
        updateF({
                    login : {
                        caOwner: caOwner,
                        caLocalName: caLocalName
                    }
                });
    } else {
        var err = new Error('Invalid login');
        err.caOwner = caOwner;
        err.caLocalName = caLocalName;
        errorF(err);
    }
};

AppActions.disableCache = function(value) {
    updateF({disableCache: value});
};

AppActions.setCurrent = function(newCurrent) {
    newCurrent = (newCurrent === null ? {url: 'blank.html', target: null} :
                  newCurrent);
    updateF({current: newCurrent});

};

AppActions.changeRemoveModal = function(current, isOpen) {
    current = (current === null ? {url: 'blank.html', target: null} : current);
    current.removeModal = isOpen;
    AppActions.setCurrent(current);
};

AppActions.changeAddModal = function(current, isOpen) {
    current = (current === null ? {url: 'blank.html', target: null} : current);
    current.addModal = isOpen;
    AppActions.setCurrent(current);
};

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

AppActions.dead = function() {
    var current = {url: 'data:text/html;charset=utf-8;base64,' +
                   DEAD_PAGE_BASE64, target: null};
    setTimeout(function() {
        AppActions.setCurrent(current);
    }, 0);
};

module.exports = AppActions;
