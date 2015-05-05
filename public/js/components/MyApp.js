var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;

var AppStore = require('../stores/AppStore');
var AppActions = require('../actions/AppActions');
var HelloModal = require('./HelloModal');
var AddModal = require('./AddModal');
var RemoveModal = require('./RemoveModal');
var ErrorModal = require('./ErrorModal');
var AppStatus = require('./AppStatus');
var AppsListDropdown = require('./AppsListDropdown');

var REMOVE_KEY = 1;
var ADD_KEY = 2;

var MyApp = {
    getInitialState: function() {
        return AppStore.getState();
    },
    componentDidMount: function() {
        AppStore.addChangeListener(this._onChange);
    },
    componentWillUnmount: function() {
        AppStore.removeChangeListener(this._onChange);
    },
    _onChange : function(ev) {
        this.setState(AppStore.getState());
    },
    handleSelect : function(selectedKey, _href, target) {
        if (selectedKey === REMOVE_KEY) {
            AppActions.changeRemoveModal(this.state.current, true);
        } else if (selectedKey === ADD_KEY) {
            AppActions.changeAddModal(this.state.current, true);
        } else if (selectedKey) {
            AppActions.setCurrent({
                                      url : this.state.current.url,
                                      target: this.state.current.target,
                                      pending: selectedKey
                                  });
        } else {
            console.log('Ignoring ' + selectedKey + ' target:' + target);
        }
    },
    render: function() {
        var navBrand = 'root-launcher';
        if (this.state.login) {
            navBrand = navBrand + '#' + this.state.login.caOwner +
                '-' + this.state.login.caLocalName;
        }
        return cE("div", {className: "container-fluid iframe-div"},
                  cE(ErrorModal, {
                         error: this.state.error
                     }),
                  cE(HelloModal, {
                         login: this.state.login
                     }),
                  cE(RemoveModal, {
                         current: this.state.current
                     }),
                  cE(AddModal, {
                         current: this.state.current,
                         login: this.state.login
                     }),
                  cE(rB.Navbar, {
                         brand: navBrand,
                         inverse: true,
                         toggleNavKey:0
                     }, cE(rB.Nav, {
                               right:true,
                               eventKey:0,
                               onSelect: this.handleSelect
                           },
                           cE(rB.NavItem, {
                                  eventKey: REMOVE_KEY
                              },
                              cE('span', {
                                     className: 'glyphicon glyphicon-remove text-danger'
                                 })),
                           cE(rB.NavItem, {
                                  eventKey: ADD_KEY
                              },
                              cE('span', {
                                     className: 'glyphicon glyphicon-plus text-success'
                                 })),
                           cE(AppsListDropdown, {
                                  onSelect: this.handleSelect,
                                  apps: this.state.apps
                              })
                          )
                    ),
                  cE('iframe', {
                         className: "iframe-fit",
                         frameBorder: 0,
                         src: this.state.current.url
                     }, null)
                 );
    }
};

module.exports = React.createClass(MyApp);
