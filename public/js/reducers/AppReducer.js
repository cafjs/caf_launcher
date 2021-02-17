var AppConstants = require('../constants/AppConstants');

var DEFAULT_CURRENT = {url: 'blank.html', target: null};


var AppReducer = function(state, action) {
    if (typeof state === 'undefined') {
        return  {
            apps: {},
            keepToken: false,
            warnKeepToken: false,
            warnDestroy: false,
            expiredTokens: [],
            current: DEFAULT_CURRENT,
            login: null,
            cost: null,
            notif: [],
            profit: 0,
            target: '',
            price: 86,
            force: false,
            clearState: false,
            units: -1,
            cacheKeys: {},
            isClosed: false,
            register: false,
            unregister: false,
            enableWarnLowUnits: true,
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
