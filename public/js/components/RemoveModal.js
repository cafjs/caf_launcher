var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;
var AppActions = require('../actions/AppActions');

class RemoveModal extends React.Component {

    constructor(props) {
        super(props);
        this.doCancel = this.doCancel.bind(this);
        this.doRemove = this.doRemove.bind(this);
        this.handleClearState = this.handleClearState.bind(this);
    }

    handleClearState() {
        const clearState =  this.refs.clearState.getChecked();
        if (!this.props.clearState && clearState) {
            AppActions.setLocalState(this.props.ctx, {warnDestroy: true});
        }
        AppActions.setLocalState(this.props.ctx, {clearState});
    }

    doRemove(ev) {
        AppActions.removeApp(this.props.ctx, this.props.current.target,
                             this.props.clearState);
        AppActions.setLocalState(this.props.ctx, {clearState: false});
        AppActions.changeRemoveModal(this.props.ctx, null, false);
    }

    doCancel(ev) {
        AppActions.setLocalState(this.props.ctx, {clearState: false});
        AppActions.changeRemoveModal(this.props.ctx, this.props.current, false);
    }

    render() {
        return cE(rB.Modal,{show: this.props.current.removeModal,
                            onHide: this.doCancel,
                            animation: false},
                  cE(rB.Modal.Header, {
                      className : "bg-warning text-warning",
                      closeButton: true},
                     cE(rB.Modal.Title, null, "Delete this app instance?")
                    ),
                  cE(rB.Modal.Body, null,
                     cE(rB.Input, {
                         type: 'text',
                         id: 'app',
                         readOnly: 'true',
                         value: this.props.current.target
                     }),
                     cE(rB.Input, {
                         label: 'Clear state',
                         type: 'checkbox',
                         ref: 'clearState',
                         checked: this.props.clearState,
                         onChange: this.handleClearState
                     })
                    ),
                  cE(rB.Modal.Footer, null,
                     cE(rB.Button, {onClick: this.doRemove}, "OK"),
                     cE(rB.Button, {onClick: this.doCancel},
                        "Cancel")
                    )
                 );
    }
};

module.exports = RemoveModal;
