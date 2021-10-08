'use strict';

const cli = require('caf_cli');
const AppActions = require('../actions/AppActions');

exports.connect = function(ctx, caOwner, caLocalName, isNewAccount, keepToken) {
    return new Promise((resolve, reject) => {
        window.location.href = cli.patchURL(window.location.href, {
            caOwner: caOwner,
            caLocalName: caLocalName,
            keepToken: keepToken,
            session: `user${cli.randomString(8)}`
        });
        var options = { unrestrictedToken: true, token: ctx.token };
        if (isNewAccount) {
            options['newAccount'] = true;
        }
        var session = new cli.Session(window.location.href, null, options);

        session.onopen = async function() {
            console.log('open session');
            try {
                resolve(await AppActions.init(ctx));
            } catch (err) {
                reject(err);
            }
        };

        session.onmessage = function(msg) {
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
