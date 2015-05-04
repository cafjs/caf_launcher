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

"use strict";
var caf = require('caf_core');
var json_rpc = caf.caf_transport.json_rpc;
var launcherUtil = require('./ca_methods_util');

exports.methods = {
    '__ca_init__' : function(cb) {
        this.state.apps = {};
        cb(null);
    },
    '__ca_resume__' : function(cp, cb) {
        this.refreshTokens(cb);
    },
    '__ca_pulse__' : function(cb) {
        this.refreshTokens(cb);
    },
    'setMegaToken' : function(megaToken, cb) {
        this.state.megaToken = megaToken;
        this.refreshTokens(cb);
    },
    'refreshTokens': function(cb) {
        var self = this;
        launcherUtil.refreshTokens(this, this.$.props.durationInSec,
                                   function(err) {
                                       if (err) {
                                           cb(err);
                                       } else {
                                           self.getStateApps(cb);
                                       }
                                   });
    },
    'addApp' : function(app, cb) {
        try {
            var appArray = json_rpc.splitName(app, json_rpc.APP_SEPARATOR);
            if (appArray.length !== 2) {
                var err = new Error('Invalid application name');
                err.app = app;
                throw err;
            }
            var ca = json_rpc.splitName(appArray[1]);
            var splitMe = json_rpc.splitName(this.__ca_getName__());
            if (ca[0] !== splitMe[0]) {
                var err = new Error('caOwner does not match');
                err.caOwnerToken =  ca[0];
                err.caOwnerLauncher = splitMe[0];
                cb(err);
            } else {
                this.state.apps[app] = null;
                this.refreshTokens(cb);
            }
        } catch (err) {
            cb(err);
        }
    },
    'removeApp' : function(app, cb) {
        delete  this.state.apps[app];
        this.refreshTokens(cb);
    },
    'getStateApps' : function(cb) {
        cb(null, this.state.apps);
    }
};

caf.init(module);

