
var React = require('react');
var MyApp = require('./components/MyApp');
var AppActions = require('./actions/AppActions');
var json_rpc = require('caf_transport').json_rpc;
var urlParser = require('url');
var querystring =  require('querystring');

var cE = React.createElement;

var extractLoginFromURL = function() {
    var url = urlParser.parse(window.location.href);
    if (url.hash) {
        var hashParsed = querystring.parse(url.hash.slice(1));
        if (hashParsed.from && (hashParsed.from === hashParsed.ca)) {
            return json_rpc.splitName(hashParsed.from);
        } else {
            return null;
        }
    } else {
        return null;
    }
};

exports.main = function(data) {
    var login = extractLoginFromURL();
    if (login) {
        AppActions.login(login[0], login[1]);
    }
    React.render(cE(MyApp, null), document.getElementById('content'));
    return null;
};
