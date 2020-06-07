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
const caf_comp = caf.caf_components;
const myUtils = caf_comp.myUtils;
const json_rpc = caf.caf_transport.json_rpc;
const launcherUtil = require('./ca_methods_util');
const APP_SESSION = 'default';

const notifyWebApp = function(self, msg) {
    self.$.session.notify([msg], APP_SESSION);
};

exports.methods = {
    async __ca_init__() {
        this.state.apps = {};
        this.state.cacheKeys = {};
        launcherUtil.createPeopleApp(this);
        this.$.session.limitQueue(1, APP_SESSION); // only the last notification
        return [];
    },
    async __ca_resume__(cp) {
        launcherUtil.createPeopleApp(this);
        this.$.session.limitQueue(1, APP_SESSION); // backwards compatible...
        return this.refreshTokens();
    },
    async __ca_pulse__() {
        return this.refreshTokens();
    },
    async hello(megaToken) {
        try {
            if (megaToken) {
                const appsState = await this.setMegaToken(megaToken);
                launcherUtil.wakeupApps(this); // do not await, best effort
                return appsState;
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
    async registerApp(appLocalName) {
        try {
            launcherUtil.checkName(appLocalName);
            await launcherUtil.registerApp(this, appLocalName);
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
                this.state.apps[app] = null;
                return this.refreshTokens();
            }
        } catch (err) {
            return [err];
        }
    },
    async removeApp(app) {
        delete this.state.apps[app];
        return this.refreshTokens();
    },
    async getStateApps() {
        return [null, {apps: this.state.apps, cacheKeys: this.state.cacheKeys}];
    }
};

caf.init(module);
