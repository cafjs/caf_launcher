var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;
var AppActions = require('../actions/AppActions');

class RemoveModal extends React.Component {

    constructor(props) {
        super(props);
    }

    doRemove(ev) {
        AppActions.removeApp(this.props.ctx, this.props.current.target);
        AppActions.changeRemoveModal(this.props.ctx, null, false);
    }

    doCancel(ev) {
        AppActions.changeRemoveModal(this.props.ctx, this.props.current, false);
    }

    render() {
        return cE(rB.Modal,{show: this.props.current.removeModal,
                            onHide: this.doCancel.bind(this),
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
                     cE(rB.Button, {onClick: this.doRemove.bind(this)}, "OK"),
                     cE(rB.Button, {onClick: this.doCancel.bind(this)},
                        "Cancel")
                    )
                 );
    }
};

module.exports = RemoveModal;
