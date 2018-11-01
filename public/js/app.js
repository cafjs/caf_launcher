
var React = require('react');
var ReactDOM = require('react-dom');
var redux = require('redux');
var AppReducer = require('./reducers/AppReducer');
var AppSession = require('./session/AppSession');
var MyApp = require('./components/MyApp');
var AppActions = require('./actions/AppActions');
var json_rpc = require('caf_transport').json_rpc;
var urlParser = require('url');
var querystring =  require('querystring');

var cE = React.createElement;

var extractInfoFromURL = function() {
    var response = {};
    var url = urlParser.parse(window.location.href);
    if (url.hash) {
        var hashParsed = querystring.parse(url.hash.slice(1));
        if (hashParsed.from && (hashParsed.from === hashParsed.ca)) {
            response.login =  json_rpc.splitName(hashParsed.from);
        }
        if (hashParsed.disableCache) {
            response.disableCache = true;
        }
    }
    return response;
};

exports.main = async function(data) {
    if (typeof window !== 'undefined') {
        try {
            var ctx = {
                store: redux.createStore(AppReducer)
            };
            var info = extractInfoFromURL();
            if (info.login) {
                await AppSession.connect(ctx, info.login[0], info.login[1]);
            }
            if (info.disableCache) {
                AppActions.disableCache(ctx, true);
            }
            ReactDOM.render(cE(MyApp, {ctx: ctx}),
                            document.getElementById('content'));
        } catch (err) {
            console.log('Got error initializing: ' + err);
        }
    }
};
