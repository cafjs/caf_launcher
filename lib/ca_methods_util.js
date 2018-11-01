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
var myUtils = caf.caf_components.myUtils;

var SLACK_IN_MSEC = 1000;

var tokens = caf.caf_security.tokens;
var util = require('util');

var toConstraints = function(all, durationInSec) {
    return all.map(function(x) {
        var c = json_rpc.splitName(x, json_rpc.APP_SEPARATOR);
        var app = json_rpc.splitName(c[0]);
        var ca = json_rpc.splitName(c[1]);
        var result = {
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

exports.wakeupApps = async function(self) {
    var wakeupOne = async function(app, token, cacheKey) {
        return self.$.crossapp.dirtyCall(app, null, 'hello',
                                         [cacheKey, null, null], token);
    };

    try {
        var allP = Object.keys(self.state.apps)
                .filter(app => (self.state.apps[app] &&
                                self.state.cacheKeys[app]))
                .map(app => wakeupOne(app, self.state.apps[app],
                                      self.state.cacheKeys[app]));
        var res = await Promise.all(allP);
        self.$.log && self.$.log.debug('All apps awake');
        return res;
    } catch (err) {
        self.$.log && self.$.log.debug('Error waking up apps: ' +
                                       myUtils.errToPrettyStr(err));
        return [err];
    }
};

exports.refreshTokens = async function(self, durationInSec) {
    var toRenew = Object.keys(self.state.apps)
        .filter(function(app) {
            var token = self.state.apps[app];
            if (token) {
                var expire = tokens.decode(token).expiresAfter;
                var now = Date.now();
                return (expire && (now > expire - SLACK_IN_MSEC));
            } else {
                return true;
            }
        });
    if (toRenew.length > 0) {
        try {
            var attenuateF = util.promisify(self.$.security.attenuateToken);
            var constraints = toConstraints(toRenew, durationInSec);
            var newTokens = await attenuateF(self.state.megaToken, constraints);
            toRenew.forEach(function(x, i) {
                self.state.apps[x] = newTokens[i];
            });
            return [];
        } catch (err) {
            return [err];
        }
    } else {
        return [];
    }
};
