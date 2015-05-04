var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;
var AppActions = require('../actions/AppActions');

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
        this.handleModal(nextProps.login  === null);
    },

    render: function() {
        return (cE('span',{}));
    },

    doLogin: function(ev) {
        var caOwner = document.getElementById('caOwner').value;
        var caLocalName = document.getElementById('caLocalName').value;
        AppActions.login(caOwner, caLocalName);
    },

    doHide: function(ev) {
        this.handleModal(false);
    },

    caOwnerChange: function(ev) {
        if (ev.key === 'Enter') {
            this.doLogin(ev);
        }
    },

  // This is called by the `OverlayMixin` when this component
  // is mounted or updated and the return value is appended to the body.
    renderOverlay: function() {
        if (this.props && (this.props.login === null)) {
console.log('modal open');
            return cE(rB.Modal, React.__spread({},  this.props, {
                                                   bsStyle: "primary",
                                                   title: "Welcome to CAF!",
                                                   onRequestHide:this.doHide,
                                                   animation: false
                                               }),
                      cE("div", {className: "modal-body"},
                         cE(rB.Input, {
                                type: 'text',
                                id: 'caOwner',
                                placeholder: 'Enter account',
                                onKeyDown: this.caOwnerChange
                            }),
                         cE(rB.Input, {
                                type: 'text',
                                id: 'caLocalName',
                                defaultValue: 'desktop1'
                            })
                        ),
                      cE("div", {className: "modal-footer"},
                         cE(rB.Button, {onClick: this.doLogin}, "Login")
                        )
                     );
        } else {
            return cE('span',{});
        }
    }
};

module.exports = React.createClass(HelloModal);
