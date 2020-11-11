// Modifications copyright 2020 Caf.js Labs and contributors
/*!
Copyright 2013 Hewlett-Packard Development Company, L.P.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

'use strict';
const caf = require('caf_core');
const json_rpc = caf.caf_transport.json_rpc;
const myUtils = caf.caf_components.myUtils;

const SLACK_IN_MSEC = 60000;

const tokens = caf.caf_security.tokens;
const util = require('util');
const USER_APP = 'root-people';
const CA_USER_APP = json_rpc.DEFAULT_QUOTA_ID;

const REGISTER_TOKEN_DURATION = 60000;

const crypto = require('crypto');

const toConstraints = function(all, durationInSec) {
    return all.map(function(x) {
        const c = json_rpc.splitName(x, json_rpc.APP_SEPARATOR);
        const app = json_rpc.splitName(c[0]);
        const ca = json_rpc.splitName(c[1]);
        const result = {
            appPublisher: app[0],
            appLocalName: app[1],
            caOwner: ca[0],
            caLocalName: ca[1]
        };
        if (durationInSec) {
            result.durationInSec = durationInSec;
        }
        return result;
    });
};

exports.checkName = function(name) {
    if ((typeof name !== 'string') || (name.length === 0) ||
        (name.match(/^[a-z0-9]+$/) === null)) {
        throw new Error('Invalid app name, lower case ASCII letters ' +
                        'and numbers only');
    }
};

exports.registerApp = async function(self, appLocalName) {
    const username = json_rpc.splitName(self.__ca_getName__())[0];
    const registerApp = json_rpc.joinNameArray([
        json_rpc.joinName(username, appLocalName),
        json_rpc.joinName(username, CA_USER_APP)
    ], json_rpc.APP_SEPARATOR);

    const userApp = json_rpc.joinNameArray([
        USER_APP,
        json_rpc.joinName(username, CA_USER_APP)
    ], json_rpc.APP_SEPARATOR);

    const attenuateF = util.promisify(self.$.security.attenuateToken);
    const constraints = toConstraints([registerApp, userApp],
                                      REGISTER_TOKEN_DURATION);
    const newTokens = await attenuateF(self.state.megaToken, constraints);
    return await self.$.crossapp.dirtyCall(userApp, null, 'registerApp',
                                           [newTokens[0]], newTokens[1]);
};

exports.getAppCost = function(self, appName) {
    const username = json_rpc.splitName(self.__ca_getName__())[0];
    const userApp = json_rpc.joinNameArray([
        USER_APP,
        json_rpc.joinName(username, CA_USER_APP)
    ], json_rpc.APP_SEPARATOR);
    const token = self.state.apps[userApp];

    if (token) {
        return self.$.crossapp.dirtyCall(userApp, null, 'getAppCost',
                                         [appName], token);
    } else {
        throw new Error('Cannot get app cost: no token for people app');
    }
};

exports.destroyCA = async function(self, app) {
    const token = self.state.apps[app];
    if (token) {
        const [err] = await self.$.crossapp.dirtyCall(
            app, null, '__external_ca_destroy__', [null], token
        );
        if (err) {
            // Already deleted, continue...
            self.$.log && self.$.log.debug(
                'Warning: Cannot destroy CA: ' + myUtils.errToPrettyStr(err)
            );
        }
    } else {

    }
};

exports.getUnits = async function(self) {
    const username = json_rpc.splitName(self.__ca_getName__())[0];
    const userApp = json_rpc.joinNameArray([
        USER_APP,
        json_rpc.joinName(username, CA_USER_APP)
    ], json_rpc.APP_SEPARATOR);
    const token = self.state.apps[userApp];

    if (token) {
        const [err, {units}] = await self.$.crossapp.dirtyCall(
            userApp, null, 'getUnits', [], token
        );
        if (err) {
            self.$.log && self.$.log.warn(
                'Error: Cannot get units: ' + myUtils.errToPrettyStr(err)
            );
            return -1;
        } else {
            return units;
        }
    } else {
        self.$.log && self.$.log.debug(
            'Cannot get units: no token for people app'
        );
        return -1;
    }
};

exports.createPeopleApp = function(self) {
    const username = json_rpc.splitName(self.__ca_getName__())[0];
    const userApp = json_rpc.joinNameArray([
        USER_APP,
        json_rpc.joinName(username, CA_USER_APP)
    ], json_rpc.APP_SEPARATOR);
    if (typeof self.state.apps[userApp] === 'undefined') {
        const cacheKey = Buffer.from(crypto.randomBytes(15))
                .toString('base64');
        self.setCacheKey(userApp, cacheKey);
        self.state.apps[userApp] = null; // create token with refreshTokens()
    }
};

const wakeupApps = exports.wakeupApps = async function(self, apps) {
    const wakeupOne = async function(app, token, cacheKey) {
        return self.$.crossapp.dirtyCall(
            app, null, 'hello', [cacheKey, token, null], token, 0 // no retry
        );
    };

    try {
        apps = apps || Object.keys(self.state.apps);
        const allP = apps
              .filter(app => (self.state.apps[app] &&
                              self.state.cacheKeys[app]))
              .map(app => wakeupOne(app, self.state.apps[app],
                                    self.state.cacheKeys[app]));
        const res = await Promise.all(allP);
        self.$.log && self.$.log.debug('All apps awake');
        return res;
    } catch (err) {
        self.$.log && self.$.log.debug('Error waking up apps: ' +
                                       myUtils.errToPrettyStr(err));
        return [err];
    }
};

exports.refreshTokens = async function(self, durationInSec) {
    const toRenew = Object.keys(self.state.apps)
        .filter(function(app) {
            const token = self.state.apps[app];
            if (token) {
                const expire = tokens.decode(token).expiresAfter;
                const now = Date.now();
                return (expire && (now > expire - SLACK_IN_MSEC));
            } else {
                return true;
            }
        });

    // do not include new CAs
    const toRenewExpired = toRenew.filter(app => !!self.state.apps[app]);

    if (toRenew.length > 0) {
        try {
            const attenuateF = util.promisify(self.$.security.attenuateToken);
            const constraints = toConstraints(toRenew, durationInSec);
            const newTokens = await attenuateF(self.state.megaToken,
                                               constraints);
            toRenew.forEach(function(x, i) {
                self.state.apps[x] = newTokens[i];
            });
            // propagate new token to devices
            await wakeupApps(self, toRenew);
            return [null, toRenewExpired];
        } catch (err) {
            return [err];
        }
    } else {
        return [null, []];
    }
};
