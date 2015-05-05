var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;
var AppActions = require('../actions/AppActions');
var json_rpc = require('caf_transport').json_rpc;

var APPS = ['root-helloworld'];

var HelloModal = {
    mixins: [rB.OverlayMixin],

    getInitialState : function() {
        return {
            isModalOpen: false
        };
    },

    handleModal: function(isOpen) {
        this.setState({ isModalOpen: isOpen });
    },

    componentWillReceiveProps: function(nextProps) {
        this.handleModal(nextProps.current.addModal);
    },

    render: function() {
        return (cE('span',{}));
    },
    doAdd: function(ev) {
        var appPublisher = document.getElementById('appPublisher').value;
        var appLocalName = document.getElementById('appLocalName').value;
        var caOwner = document.getElementById('caOwner').value;
        var caLocalName = document.getElementById('caLocalName').value;
        var app = json_rpc
            .joinNameArray([json_rpc.joinName(appPublisher, appLocalName),
                            json_rpc.joinName(caOwner, caLocalName)],
                           json_rpc.APP_SEPARATOR);
        AppActions.setCurrent({
                                  url : this.props.current.url,
                                  target: this.props.current.target,
                                  pending: app
                              });
        AppActions.addApp(app);
    },
    doHide: function(ev) {
        this.handleModal(false);
    },

    submit: function(ev) {
        if (ev.key === 'Enter') {
            this.doAdd(ev);
        }
    },

    onSelect: function(selectedKey) {
        var split = json_rpc.splitName(selectedKey);
        document.getElementById('appPublisher').value = split[0];
        document.getElementById('appLocalName').value = split[1];
    },

  // This is called by the `OverlayMixin` when this component
  // is mounted or updated and the return value is appended to the body.
    renderOverlay: function() {
        if (this.state.isModalOpen) {
            return cE(rB.Modal, React.__spread({},  this.props, {
                                                   bsStyle: "primary",
                                                   title: "Add application",
                                                   onRequestHide:this.doHide,
                                                   animation: false
                                               }),
                      cE("div", {className: "modal-body"},
                         cE(rB.Input, {
                                type: 'text',
                                id: 'appPublisher',
                                placeholder: 'Enter application publisher'
                            }),
                          cE(rB.Input, {
                                type: 'text',
                                id: 'appLocalName',
                                placeholder: 'Enter application name'
                            }),
                         cE(rB.Input, {
                                type: 'text',
                                id: 'caOwner',
                                defaultValue: this.props.login.caOwner,
                                placeholder: 'Enter account name'
                            }),
                         cE(rB.Input, {
                                type: 'text',
                                id: 'caLocalName',
                                placeholder: 'Enter CA name',
                                onKeyDown: this.submit
                            })
                        ),
                      cE("div", {className: "modal-footer"},
                         cE(rB.DropdownButton, {
                                onSelect: this.onSelect,
                                title: 'Find'
                            },
                            APPS.map(function(x, i) {
                                    return cE(rB.MenuItem, {
                                                key:i*232131,
                                                eventKey: x,
                                                href: null,
                                                target: x
                                              }, x);
                                     })
                           ),
                         cE(rB.Button, {onClick: this.doAdd}, "Add")
                        )
                     );
        } else {
            return cE('span',{});
        }
    }
};

module.exports = React.createClass(HelloModal);
