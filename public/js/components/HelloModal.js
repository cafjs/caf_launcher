var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;
var AppActions = require('../actions/AppActions');

var HelloModal = {

    getInitialState : function() {
        return {
            isModalOpen: true
        };
    },

    handleModal: function(isOpen) {
        this.setState({ isModalOpen: isOpen });
    },
    doLogin: function(ev) {
        var caOwner = this.refs.caOwner.getValue();
        var caLocalName = this.refs.caLocalName.getValue();
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

    render: function() {
        var shouldRender = (this.props.login === null);

        return cE(rB.Modal, {show: shouldRender && this.state.isModalOpen,
                             onHide: this.doHide,
                             animation: false},
                  cE(rB.Modal.Header, {
                         className : "bg-primary text-primary",
                         closeButton: true
                     },
                     cE(rB.Modal.Title, null, "Welcome to CAF!")
                    ),
                  cE(rB.Modal.Body, null,
                     cE(rB.Input, {
                         type: 'text',
                         id: 'caOwner',
                         ref: 'caOwner',
                         placeholder: 'Enter account',
                         onKeyDown: this.caOwnerChange
                     }),
                     cE(rB.Input, {
                         type: 'text',
                         id: 'caLocalName',
                         ref: 'caLocalName',
                         defaultValue: 'desktop1'
                     })
                    ),
                  cE(rB.Modal.Footer, null,
                     cE(rB.Button, {onClick: this.doLogin}, "Login")
                    )
                 );
    }
};

module.exports = React.createClass(HelloModal);
