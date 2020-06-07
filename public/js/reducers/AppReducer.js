var AppConstants = require('../constants/AppConstants');

var DEFAULT_CURRENT = {url: 'blank.html', target: null};


var AppReducer = function(state, action) {
    if (typeof state === 'undefined') {
        return  {
            apps: {},
            expiredTokens: [],
            current: DEFAULT_CURRENT,
            login: null,
            notif: [],
            cacheKeys: {},
            isClosed: false,
            register: false,
            disableCache: false
        };
    } else {
        switch(action.type) {
        case AppConstants.APP_UPDATE:
        case AppConstants.APP_NOTIFICATION:
            return Object.assign({}, state, action.state);
        case AppConstants.APP_ERROR:
            return Object.assign({}, state, {error: action.error});
        case AppConstants.WS_STATUS:
            return Object.assign({}, state, {isClosed: action.isClosed});
        default:
            return state;
        }
    };
};

module.exports = AppReducer;
