var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;

var AppActions = require('../actions/AppActions');
var HelloModal = require('./HelloModal');
var AddModal = require('./AddModal');
var RemoveModal = require('./RemoveModal');
var ErrorModal = require('./ErrorModal');
var AppStatus = require('./AppStatus');
var MenuBurger = require('./MenuBurger');
var Iframe = require('./Iframe');

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
        return cE("div", {id: 'outer-container',
                          className: "container-fluid iframe-div"},
                  cE(ErrorModal, {
                      ctx: this.props.ctx,
                      error: this.state.error
                  }),
                  cE(HelloModal, {
                      ctx: this.props.ctx,
                      login: this.state.login
                  }),
                  cE(RemoveModal, {
                      ctx: this.props.ctx,
                      current: this.state.current
                  }),
                  cE(AddModal, {
                      ctx: this.props.ctx,
                      current: this.state.current,
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
