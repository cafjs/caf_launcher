var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;
var AppActions = require('../actions/AppActions');

var ErrorModal = {
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
        this.handleModal(nextProps.error);
    },

    render: function() {
        return (cE('span',{}));
    },
    doDismissError: function(ev) {
        AppActions.resetError();
        this.handleModal(false);
    },

  // This is called by the `OverlayMixin` when this component
  // is mounted or updated and the return value is appended to the body.
    renderOverlay: function() {
        if (this.state.isModalOpen) {
            return cE(rB.Modal, React.__spread({},  this.props, {
                                                   bsStyle: "primary",
                                                   title: "Warning!",
                                                   onRequestHide:this
                                                       .doDismissError,
                                                   animation: false}),
                      cE("div", {className: "modal-body"},
                         cE('p', null, 'Got Error:',
                            cE(rB.Alert, {bsStyle: 'danger'},
                               this.props.error && this.props.error.message)
                           )
                         /*,
                          cE('p', null, 'Debug Info:\n',
                          this.props.error && this.props.error.stack,
                          this.props.error.request &&
                          this.props.error.request)
                          */
                        ),
                      cE("div", {className: "modal-footer"},
                         cE(rB.Button, {onClick: this.doDismissError},
                            "Continue")
                        )
                     );
        } else {
            return cE('span',{});
        }
    }
};

module.exports = React.createClass(ErrorModal);
