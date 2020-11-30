const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;
const AppActions = require('../actions/AppActions');

class RemoveModal extends React.Component {

    constructor(props) {
        super(props);
        this.doCancel = this.doCancel.bind(this);
        this.doRemove = this.doRemove.bind(this);
        this.handleClearState = this.handleClearState.bind(this);
        this.handleForce = this.handleForce.bind(this);
    }

    handleClearState(e) {
        const clearState = e.target.checked;
        if (!this.props.clearState && clearState) {
            AppActions.setLocalState(this.props.ctx, {warnDestroy: true});
        }
        AppActions.setLocalState(this.props.ctx, {clearState});
    }

    handleForce(e) {
        const force = e.target.checked;
        AppActions.setLocalState(this.props.ctx, {force});
    }

    doRemove(ev) {
        AppActions.removeApp(this.props.ctx, this.props.current.target,
                             !!this.props.clearState, !!this.props.force);
        AppActions.setLocalState(this.props.ctx, {clearState: false,
                                                  force: false});
        AppActions.changeRemoveModal(this.props.ctx, null, false);
    }

    doCancel(ev) {
        AppActions.setLocalState(this.props.ctx, {clearState: false,
                                                  force: false});
        AppActions.changeRemoveModal(this.props.ctx, this.props.current, false);
    }

    render() {
        return cE(rB.Modal,{show: this.props.current.removeModal,
                            onHide: this.doCancel,
                            animation: false},
                  cE(rB.Modal.Header, {
                      className : 'bg-primary text-primary',
                      closeButton: true},
                     cE(rB.Modal.Title, null, 'Delete this CA?')
                    ),
                  cE(rB.Modal.Body, null,
                     cE(rB.Form, {horizontal: true},
                        cE(rB.FormGroup, {controlId: 'appId'},
                           cE(rB.Col, {sm: 3, xs: 12},
                              cE(rB.ControlLabel, null, 'App')
                             ),
                           cE(rB.Col, {sm: 9, xs: 12},
                              cE(rB.FormControl, {
                                  type: 'text',
                                  readOnly: true,
                                  value: this.props.current.target || ''
                              })
                             )
                          ),
                        cE(rB.FormGroup, {controlId: 'clearStateId'},
                           cE(rB.Col, {sm: 3, xs: 4},
                              cE(rB.ControlLabel, null, 'Clear State')
                             ),
                           cE(rB.Col, {sm: 1, xs: 2},
                              cE(rB.Checkbox, {
                                  checked: this.props.clearState,
                                  onChange: this.handleClearState
                              })
                             )
                          ),
                        cE(rB.FormGroup, {controlId: 'forceId'},
                           cE(rB.Col, {sm: 3, xs: 4},
                              cE(rB.ControlLabel, null, 'Force')
                             ),
                           cE(rB.Col, {sm: 1, xs: 2},
                              cE(rB.Checkbox, {
                                  checked: this.props.force,
                                  onChange: this.handleForce
                              })
                             )
                          )
                       )
                    ),
                  cE(rB.Modal.Footer, null,
                     cE(rB.Button, {onClick: this.doRemove,
                                    bsStyle: 'danger'}, 'Confirm'),
                     cE(rB.Button, {onClick: this.doCancel},
                        'Cancel')
                    )
                 );
    }
};

module.exports = RemoveModal;
