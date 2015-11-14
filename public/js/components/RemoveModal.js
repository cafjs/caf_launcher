var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;
var AppActions = require('../actions/AppActions');

var RemoveModal = {

    doRemove: function(ev) {
        AppActions.removeApp(this.props.current.target);
        AppActions.changeRemoveModal(null, false);
    },

    doCancel: function(ev) {
        AppActions.changeRemoveModal(this.props.current, false);
    },

    render: function() {
            return cE(rB.Modal,{show: this.props.current.removeModal,
                                onHide: this.doCancel,
                                animation: false},
                      cE(rB.Modal.Header, {
                          className : "bg-warning text-warning",
                          closeButton: true},
                         cE(rB.Modal.Title, null, "Delete this app?")
                        ),
                      cE(rB.ModalBody, null,
                         cE(rB.Input, {
                             type: 'text',
                             id: 'app',
                             readOnly: 'true',
                             value: this.props.current.target
                         })
                        ),
                      cE(rB.Modal.Footer, null,
                         cE(rB.Button, {onClick: this.doRemove}, "OK"),
                         cE(rB.Button, {onClick: this.doCancel}, "Cancel")
                        )
                     );
    }
};

module.exports = React.createClass(RemoveModal);
