var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;
var AppActions = require('../actions/AppActions');

var RemoveModal = {
    mixins: [rB.OverlayMixin],

    getInitialState : function() {
        return {
            isModalOpen: false
        };
    },

    handleModal: function(isOpen) {
        this.setState({isModalOpen: isOpen });
    },

    componentWillReceiveProps: function(nextProps) {
        this.handleModal(nextProps.current.removeModal);
    },

    render: function() {
        return (cE('span',{}));
    },

    doRemove: function(ev) {
        AppActions.removeApp(this.props.current.target);
        AppActions.setCurrent(null);
        this.handleModal(false);
    },

    doCancel: function(ev) {
        AppActions.changeRemoveModal(this.props.current, false);
        this.handleModal(false);
    },

  // This is called by the `OverlayMixin` when this component
  // is mounted or updated and the return value is appended to the body.
    renderOverlay: function() {
        if (this.state.isModalOpen) {
            return cE(rB.Modal,
                      React.__spread({},  this.props, {
                                         bsStyle: "warning",
                                         title: "Delete this app?",
                                         onRequestHide:this.doCancel,
                                         animation: false
                                     }),
                      cE("div", {className: "modal-body"},
                         cE(rB.Input, {
                                type: 'text',
                                id: 'app',
                                readOnly: 'true',
                                value: this.props.current.target
                            })
                        ),
                      cE("div", {className: "modal-footer"},
                         cE(rB.Button, {onClick: this.doRemove}, "OK"),
                         cE(rB.Button, {onClick: this.doCancel}, "Cancel")
                        )
                     );
        } else {
            return cE('span',{});
        }
    }
};

module.exports = React.createClass(RemoveModal);
