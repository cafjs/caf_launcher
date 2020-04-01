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
var caf = require('caf_core');
var json_rpc = caf.caf_transport.json_rpc;
var launcherUtil = require('./ca_methods_util');

exports.methods = {
    async __ca_init__() {
        this.state.apps = {};
        this.state.cacheKeys = {};
        launcherUtil.createPeopleApp(this);
        return [];
    },
    async __ca_resume__(cp) {
        launcherUtil.createPeopleApp(this);
        return this.refreshTokens();
    },
    async __ca_pulse__() {
        return this.refreshTokens();
    },
    async hello(megaToken) {
        try {
            if (megaToken) {
                var appsState = await this.setMegaToken(megaToken);
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
                await launcherUtil.refreshTokens(this,
                                                 this.$.props.durationInSec);
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
            var appArray = json_rpc.splitName(app, json_rpc.APP_SEPARATOR);
            if (appArray.length !== 2) {
                var err = new Error('Invalid application name');
                err.app = app;
                return [err];
            }
            var appName = json_rpc.splitName(appArray[0]);
            if (appName.length !== 2) {
                err = new Error('Invalid app name');
                err.appName = appName;
                return [err];
            }
            launcherUtil.checkName(appName[0]);
            launcherUtil.checkName(appName[1]);

            var ca = json_rpc.splitName(appArray[1]);
            if (ca.length !== 2) {
                err = new Error('Invalid CA name');
                err.ca = ca;
                return [err];
            }
            launcherUtil.checkName(ca[0]);
            launcherUtil.checkName(ca[1]);

            var splitMe = json_rpc.splitName(this.__ca_getName__());
            if (ca[0] !== splitMe[0]) {
                err = new Error('caOwner does not match');
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
