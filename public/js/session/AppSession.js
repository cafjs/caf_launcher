var cli = require('caf_cli');
var AppActions = require('../actions/AppActions');

exports.connect = function(ctx, caOwner, caLocalName) {
    return new Promise((resolve, reject) => {
        window.location.href = cli.patchURL(window.location.href, {
            caOwner: caOwner,
            caLocalName: caLocalName
        });
        var session = new cli.Session(window.location.href, null,
                                      {unrestrictedToken: true});

        session.onopen = async function() {
            console.log('open session');
            try {
                resolve(await AppActions.init(ctx));
            } catch (err) {
                reject(err);
            }
        };

        session.onmessage = function(msg) {
            //        console.log('message:' + JSON.stringify(msg));
            AppActions.message(ctx, msg);
        };

        session.onclose = function(err) {
            console.log('Closing:' + JSON.stringify(err));
            AppActions.closing(ctx, err);
            err && reject(err); // no-op if session already opened
        };

        ctx.session = session;

        AppActions.setLocalState(ctx, {login: { caOwner: caOwner,
                                                caLocalName: caLocalName}});

    });
};
