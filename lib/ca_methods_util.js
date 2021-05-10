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
const assert = require('assert');
const caf = require('caf_core');
const json_rpc = caf.caf_transport.json_rpc;
const myUtils = caf.caf_components.myUtils;

const SLACK_IN_MSEC = 60000;

const tokens = caf.caf_security.tokens;
const util = require('util');
const USER_APP = 'root-people';
const CA_USER_APP = json_rpc.DEFAULT_QUOTA_ID;

const REGISTER_TOKEN_DURATION = 60000;

const PLANS = ['platinum', 'gold', 'silver', 'bronze'];

const COST_OF_PLANS = {'platinum': 1.6896, 'gold': 0.8448, 'silver': 0.4224,
                       'bronze' : 0.2112};

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

const checkPlan = exports.checkPlan = function (plan) {
    if (!PLANS.includes(plan)) {
        throw new Error(`Invalid plan ${plan}, valid choices are ${PLANS}`);
    };
};

const getAppTokens = async function(self, appLocalName) {
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
    return [userApp, newTokens];
};

exports.registerApp = async function(self, appLocalName, plan, profit) {
    const [userApp, tokens] = await getAppTokens(self, appLocalName);
    return await self.$.crossapp.dirtyCall(
        userApp, null, 'registerApp', [tokens[0], plan, profit], tokens[1]
    );
};

exports.estimateDaysPerUnit = function(plan, profit) {
    const clipProfit = (x) => (x < 0 ? 0 : (x > 0.9 ? 0.9 : x));

    checkPlan(plan);
    assert((profit >= 0) && (profit <= 0.9));

    const base = COST_OF_PLANS[plan];
    const cost = base/(1-profit);
    const days = 365/(10*cost);
    const integerDays = Math.round(days);
    const costRound = 365/(10*integerDays);
    const profitRound = (costRound-base)/costRound;
    return [clipProfit(profitRound), integerDays];
};

const checkAppRunning = function(self, appLocalName) {
    const username = json_rpc.splitName(self.__ca_getName__())[0];
    const appName = json_rpc.joinName(username, appLocalName);
    return self.$.crossapp.dirtyIsAppRunning(appName);
};

exports.unregisterApp = async function(self,  appLocalName) {
    const isRunning = await checkAppRunning(self, appLocalName);
    if (isRunning) {
        throw new Error('The app is still running. You can shut it down with' +
                        " the 'turtles' app");
    } else {
        const [userApp, tokens] = await getAppTokens(self, appLocalName);
        return await self.$.crossapp.dirtyCall(userApp, null, 'unregisterApp',
                                               [tokens[0]], tokens[1]);
    }
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

const unregisterCA = async function(self, app, appToken) {
    const username = json_rpc.splitName(self.__ca_getName__())[0];
    const userApp = json_rpc.joinNameArray([
        USER_APP,
        json_rpc.joinName(username, CA_USER_APP)
    ], json_rpc.APP_SEPARATOR);
    const token = self.state.apps[userApp];

    if (token) {
        const [err, nClear] = await self.$.crossapp.dirtyCall(
            userApp, null, 'unregisterCA', [appToken], token
        );

        if (err) {
            self.$.log && self.$.log.debug(
                'Error: Cannot unregister CA: ' + myUtils.errToPrettyStr(err)
            );
        }

        return [err, nClear];
    } else {
        return [new Error('unregisterCA: no token found for people app')];
    }
};

exports.destroyCA = async function(self, app, force) {
    const token = self.state.apps[app];
    if (token) {
        const [err] = await self.$.crossapp.dirtyCall(
            app, null, '__external_ca_destroy__', [null], token, 0 // no retry
        );
        if (err) {
            if (json_rpc.getSystemErrorCode(err) ===
                json_rpc.ERROR_CODES.notAuthorized) {
                /* CA's creation blocked for 'destroy' call.
                 *
                 *  This means it was already deleted, so we continue...
                 */
                self.$.log && self.$.log.debug(
                    'Warning: Cannot destroy CA: ' + myUtils.errToPrettyStr(err)
                );
            } else {
                if (force) {
                    self.$.log && self.$.log.warn(
                        `Warning: destroy ${app} failed, ignoring exception: ` +
                            myUtils.errToPrettyStr(err)
                    );
                } else {
                    return [err];
                }
            }
        }
        return await unregisterCA(self, app, token);
    } else {
        return [new Error('Missing token, cannot clear CA state')];
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
