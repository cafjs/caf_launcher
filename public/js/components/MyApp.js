const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;

const AppActions = require('../actions/AppActions');
const HelloModal = require('./HelloModal');
const AddModal = require('./AddModal');
const RemoveModal = require('./RemoveModal');
const RegisterModal = require('./RegisterModal');
const UnregisterModal = require('./UnregisterModal');
const ErrorModal = require('./ErrorModal');
const AppStatus = require('./AppStatus');
const MenuBurger = require('./MenuBurger');
const Iframe = require('./Iframe');
const WarnKeepToken = require('./WarnKeepToken');
const WarnDestroy = require('./WarnDestroy');
const WarnLowUnits = require('./WarnLowUnits');

class MyApp extends React.Component {

    constructor(props) {
        super(props);
        this.state = this.props.ctx.store.getState();
    }

    componentDidMount() {
        if (!this.unsubscribe) {
            this.unsubscribe = this.props.ctx.store
                .subscribe(this._onChange.bind(this));
            this._onChange();
        }
    }

    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
    }

    _onChange() {
        if (this.unsubscribe) {
            this.setState(this.props.ctx.store.getState());
        }
    }

    render() {

        if (this.state.isClosed) {
            AppActions.dead(this.props.ctx);
        }

        if (Array.isArray(this.state.expiredTokens) &&
            (this.state.expiredTokens.length > 0)) {
            if (this.state.expiredTokens.includes(this.state.current.target)) {
                // Manual recovery by the user
                AppActions.setCurrent(this.props.ctx, null);

            }
            AppActions.refreshTokens(this.props.ctx);
            AppActions.setLocalState(this.props.ctx, {expiredTokens: []});
        }

        return cE("div", {id: 'outer-container',
                          className: "container-fluid iframe-div"},
                  cE(ErrorModal, {
                      ctx: this.props.ctx,
                      error: this.state.error
                  }),
                  cE(WarnKeepToken, {
                      ctx: this.props.ctx,
                      warnKeepToken: this.state.warnKeepToken
                  }),
                  cE(WarnDestroy, {
                      ctx: this.props.ctx,
                      warnDestroy: this.state.warnDestroy
                  }),
                  cE(WarnLowUnits, {
                      ctx: this.props.ctx,
                      enableWarnLowUnits: this.state.enableWarnLowUnits,
                      units: this.state.units
                  }),
                  cE(HelloModal, {
                      ctx: this.props.ctx,
                      keepToken: this.state.keepToken,
                      login: this.state.login
                  }),
                  cE(RemoveModal, {
                      ctx: this.props.ctx,
                      target: this.state.target || this.state.current.target,
                      current: this.state.current,
                      clearState: this.state.clearState,
                      force: this.state.force
                  }),
                  cE(AddModal, {
                      ctx: this.props.ctx,
                      current: this.state.current,
                      cost: this.state.cost,
                      login: this.state.login
                  }),
                  cE(RegisterModal, {
                      ctx: this.props.ctx,
                      register: this.state.register,
                      login: this.state.login,
                      price: this.state.price,
                      profit: this.state.profit
                  }),
                  cE(UnregisterModal, {
                      ctx: this.props.ctx,
                      unregister: this.state.unregister,
                      login: this.state.login
                  }),
                  cE(MenuBurger, {
                      ctx: this.props.ctx,
                      current: this.state.current,
                      login: this.state.login,
                      apps: this.state.apps
                  }),
                  cE(Iframe, {
                      ctx: this.props.ctx,
                      current: this.state.current,
                      disableCache: this.state.disableCache,
                      apps: this.state.apps,
                      cacheKeys: this.state.cacheKeys
                  })
                 );
    }
};

module.exports = MyApp;
