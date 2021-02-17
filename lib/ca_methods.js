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
const caf_comp = caf.caf_components;
const myUtils = caf_comp.myUtils;
const json_rpc = caf.caf_transport.json_rpc;
const launcherUtil = require('./ca_methods_util');
const APP_SESSION = 'default';
const WAKEUP_RATIO = 0.25;

const notifyWebApp = function(self, msg) {
    self.$.session.notify([msg], APP_SESSION);
};

exports.methods = {
    async __ca_init__() {
        this.state.apps = {};
        this.state.cacheKeys = {};
        this.state.lastWakeupInSec = (new Date()).getTime()/1000;
        launcherUtil.createPeopleApp(this);
        this.$.session.limitQueue(1, APP_SESSION); // only the last notification
        return [];
    },
    async __ca_resume__(cp) {
        launcherUtil.createPeopleApp(this);
        launcherUtil.wakeupApps(this); // do not await, best effort
        this.state.lastWakeupInSec = (new Date()).getTime()/1000;
        this.$.session.limitQueue(1, APP_SESSION); // backwards compatible...
        return this.refreshTokens();
    },
    async __ca_pulse__() {
        const nowInSec = (new Date()).getTime()/1000;
        if (nowInSec - this.state.lastWakeupInSec >
            WAKEUP_RATIO * this.$.props.durationInSec) {
            /*
             * `__ca_pulse__` may not run in a crashed/recover app until a
             * successful login wakes CAs up. With preemtible VMs that could
             * happen every 24h.
             *
             * The goal is to put a bound on how long before
             *  `__ca_pulse__` methods are called.
             *
             * But waking up apps is expensive, we don't want to do that often.
             *
             * For example, with a 24h token and preemtible VMs we limit max
             * hybernation time to 6 hours with 4 wake ups a day.
             * Assuming an app renders for 15 min each time, the overhead for
             * idle CAs is less than 5% of one constantly busy.
             *
             * When we "delete" the app, we no longer wake it up, keeping it
             * hybernated until we permanently destroy it, or we add it again
             * to the launcher. Hybernated CAs are really cheap, they typically
             * only need a few KBs of Redis memory.
             */
            launcherUtil.wakeupApps(this); // do not await, best effort
            this.state.lastWakeupInSec = nowInSec;
        }
        return this.refreshTokens();
    },
    async hello(megaToken) {
        try {
            if (megaToken) {
                const [err, appsState] = await this.setMegaToken(megaToken);
                if (err) {
                    return [err];
                } else {
                    appsState.units = await launcherUtil.getUnits(this);
                    this.state.lastWakeupInSec =  (new Date()).getTime()/1000;
                    launcherUtil.wakeupApps(this); // do not await, best effort
                    return [err, appsState];
                }
            } else {
                return this.refreshTokens();
            }
        } catch (err) {
            return [err];
        }
    },
    async setCacheKey(key, value) {
        this.state.cacheKeys = this.state.cacheKeys || {};
        this.state.cacheKeys[key] = value;
        return this.getStateApps();
    },
    async setMegaToken(megaToken) {
        this.state.megaToken = megaToken;
        return this.refreshTokens();
    },
    async refreshTokens() {
        try {
            if (this.state.megaToken) {
                const [err, expiredTokens] = await launcherUtil.refreshTokens(
                    this, this.$.props.durationInSec
                );
                if (err) {
                    this.$.log && this.$.log.warn('Cannot attenuate token' +
                                                  myUtils.errToPrettyStr(err));
                } else if (Array.isArray(expiredTokens) &&
                           (expiredTokens.length > 0)) {
                    notifyWebApp(this, {expiredTokens});
                }
            } else {
                this.$.log && this.$.log.warn('Skipping refreshTokens(), ' +
                                              'no megatoken');
            }
            return this.getStateApps();
        } catch (err) {
            return [err];
        }
    },
    async getAppCost(appName) {
        try {
            const splitAppName = json_rpc.splitName(appName);
            if (splitAppName.length !== 2) {
                const err = new Error('Invalid application name');
                err.appName = appName;
                return [err];
            }
            launcherUtil.checkName(splitAppName[0]);
            launcherUtil.checkName(splitAppName[1]);
            // type returned [Error=, {cost: {appName:string, value: number}}]
            return await launcherUtil.getAppCost(this, appName);
        } catch (err) {
            return [err];
        }
    },
    async registerApp(appLocalName, plan, profit) {
        try {
            launcherUtil.checkName(appLocalName);
            launcherUtil.checkPlan(plan);
            assert((profit >= 0) && (profit <= 0.9));
            await launcherUtil.registerApp(this, appLocalName, plan, profit);
            return this.getStateApps();
        } catch (err) {
            return [err];
        }
    },
    async getDaysPerUnit(plan, profitOriginal) {
        const [profit, price] = launcherUtil.estimateDaysPerUnit(
            plan, profitOriginal
        );
        return [null, {profit, price}];
    },
    async unregisterApp(appLocalName) {
        try {
            launcherUtil.checkName(appLocalName);
            await launcherUtil.unregisterApp(this, appLocalName);
            return this.getStateApps();
        } catch (err) {
            return [err];
        }
    },
    async addApp(app) {
        try {
            const appArray = json_rpc.splitName(app, json_rpc.APP_SEPARATOR);
            if (appArray.length !== 2) {
                const err = new Error('Invalid application name');
                err.app = app;
                return [err];
            }
            const appName = json_rpc.splitName(appArray[0]);
            if (appName.length !== 2) {
                const err = new Error('Invalid app name');
                err.appName = appName;
                return [err];
            }
            launcherUtil.checkName(appName[0]);
            launcherUtil.checkName(appName[1]);

            const ca = json_rpc.splitName(appArray[1]);
            if (ca.length !== 2) {
                const err = new Error('Invalid CA name');
                err.ca = ca;
                return [err];
            }
            launcherUtil.checkName(ca[0]);
            launcherUtil.checkName(ca[1]);

            const splitMe = json_rpc.splitName(this.__ca_getName__());
            if (ca[0] !== splitMe[0]) {
                const err = new Error('caOwner does not match');
                err.caOwnerToken = ca[0];
                err.caOwnerLauncher = splitMe[0];
                return [err];
            } else {
                const units = await launcherUtil.getUnits(this);
                if (units < 1) {
                    return [new Error('No units left. You can add ' +
                                      "more units with the 'people' app.")];
                } else {
                    this.state.apps[app] = null;
                    return this.refreshTokens();
                }
            }
        } catch (err) {
            return [err];
        }
    },
    async removeApp(app, clearState, force) {
        try {
            if (this.state.apps[app]) {
                if (clearState) {
                    const [err] = await launcherUtil.destroyCA(this, app,
                                                               force);
                    if (err) {
                        return [err];
                    }
                }
                delete this.state.apps[app];
                return this.refreshTokens();
            } else {
                const err = new Error('Cannot remove missing CA');
                return [err];
            }
        } catch (err) {
            return [err];
        }
    },
    async getStateApps() {
        return [null, {apps: this.state.apps, cacheKeys: this.state.cacheKeys}];
    }
};

caf.init(module);
