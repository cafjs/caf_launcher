const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;
const AppActions = require('../actions/AppActions');


class UnregisterModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {appLocalName: ''};
        this.doCancel = this.doCancel.bind(this);
        this.doUnregister = this.doUnregister.bind(this);
        this.handleAppLocalName = this.handleAppLocalName.bind(this);
        this.submit = this.submit.bind(this);
        this.captureRef = React.createRef();
    }

    componentDidUpdate() {
        if (this.captureRef.current && this.props.unregister) {
            this.captureRef.current.focus();
        }
    }

    doUnregister(ev) {
        AppActions.unregisterApp(this.props.ctx, this.state.appLocalName);
        AppActions.changeUnregisterModal(this.props.ctx, false);
    }

    doCancel(ev) {
        AppActions.changeUnregisterModal(this.props.ctx, false);
    }

    handleAppLocalName(ev) {
        this.setState({appLocalName: ev.target.value});
    }

    submit(ev) {
        if (ev.key === 'Enter') {
            ev.preventDefault();
            this.doUnregister(ev);
        }
    }

    render() {
        return cE(rB.Modal, {show: this.props.unregister,
                             onHide: this.doCancel,
                             animation: false},
                  cE(rB.Modal.Header, {
                      className : 'bg-primary text-primary',
                      closeButton: true
                  }, cE(rB.Modal.Title, null, 'Unregister application')),
                  cE(rB.Modal.Body, null,
                     cE(rB.Form, {horizontal: true},
                        cE(rB.FormGroup, {controlId: 'warningId'},
                           cE(rB.Col, {sm: 12, xs: 12},
                              cE(rB.ControlLabel, null, 'Warning:' +
                                 ' This operation cannot be undone' +
                                 ' and the state of your app will be lost.')
                             )
                          ),
                        cE(rB.FormGroup, {controlId: 'appPubId'},
                           cE(rB.Col, {sm: 6, xs: 12},
                              cE(rB.ControlLabel, null, 'App Publisher')
                             ),
                           cE(rB.Col, {sm: 6, xs: 12},
                              cE(rB.FormControl, {
                                  type: 'text',
                                  readOnly: true,
                                  value: (this.props.login &&
                                          this.props.login.caOwner) || ''
                              })
                             )
                          ),
                        cE(rB.FormGroup, {controlId: 'appLocalName2Id'},
                           cE(rB.Col, {sm: 6, xs: 12},
                              cE(rB.ControlLabel, null, 'App Name')
                             ),
                           cE(rB.Col, {sm: 6, xs: 12},
                              cE(rB.FormControl, {
                                  type: 'text',
                                  value: this.state.appLocalName,
                                  onChange: this.handleAppLocalName,
                                  placeholder: 'helloworld',
                                  onKeyPress: this.submit,
                                  inputRef: this.captureRef
                              })
                             )
                          )
                       )
                    ),
                  cE(rB.Modal.Footer, null,
                     cE(rB.Button, {onClick: this.doUnregister,
                                    bsStyle: 'danger'}, 'Unregister'),
                     cE(rB.Button, {onClick: this.doCancel}, 'Cancel')
                    )
                 );
    }
}

module.exports = UnregisterModal;
