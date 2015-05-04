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

var SLACK_IN_MSEC = 1000;

var tokens = require('caf_security').tokens;

var toConstraints = function(all, durationInSec) {
    return all.map(function(x) {
                       var c =  json_rpc.splitName(x, json_rpc.APP_SEPARATOR);
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

exports.refreshTokens = function(self, durationInSec, cb) {
    var toRenew = Object.keys(self.state.apps)
        .filter(function(app) {
                    var token = self.state.apps[app];
                    if (token) {
                         var expire = tokens.decode(token).expiresAfter;
                         var now = Date.now();
                         return (expire && (now < expire + SLACK_IN_MSEC));
                     } else {
                         return true;
                     }
                });
    if (toRenew.length  > 0) {
        var cb0 = function(err, newTokens) {
            if (err) {
                cb(err);
            } else {
                toRenew.forEach(function(x, i) {
                                    self.state.apps[x] = newTokens[i];
                                });
                cb(null);
            }
        };
        self.$.security.attenuateToken(self.state.megaToken,
                             toConstraints(toRenew, durationInSec), cb0);
    } else {
        cb(null);
    }
};
