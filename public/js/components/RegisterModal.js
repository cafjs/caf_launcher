const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;
const AppActions = require('../actions/AppActions');


class RegisterModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
        this.doCancel = this.doCancel.bind(this);
        this.doRegister = this.doRegister.bind(this);
        this.handleAppLocalName = this.handleAppLocalName.bind(this);
        this.submit = this.submit.bind(this);
    }

    doRegister(ev) {
        AppActions.registerApp(this.props.ctx, this.state.appLocalName);
        AppActions.changeRegisterModal(this.props.ctx, false);
    }

    doCancel(ev) {
        AppActions.changeRegisterModal(this.props.ctx, false);
    }

    handleAppLocalName() {
        this.setState({appLocalName: this.refs.appLocalName.getValue()});
    }

    submit(ev) {
        this.handleAppLocalName(ev);
        if (ev.key === 'Enter') {
            this.doRegister(ev);
        }
    }

    render() {
        return cE(rB.Modal, {show: this.props.register,
                             onHide: this.doCancel,
                             animation: false},
                  cE(rB.Modal.Header, {
                      className : 'bg-primary text-primary',
                      closeButton: true
                  }, cE(rB.Modal.Title, null, 'Register application')),
                  cE(rB.Modal.Body, null,
                     cE('h4', null, 'The price of registering an app is ' +
                        ' one unit every 10 days.'),
                     cE(rB.Input, {
                         type: 'text',
                         ref: 'appPublisher',
                         readOnly: true,
                         value:  (this.props.login &&
                                 this.props.login.caOwner) || ''
                     }),
                     cE(rB.Input, {
                         type: 'text',
                         ref: 'appLocalName',
                         value: this.state.appLocalName,
                         onChange : this.handleAppLocalName,
                         onKeyDown: this.submit,
                         placeholder: 'Enter application name'
                     })
                    ),
                  cE(rB.Modal.Footer, null,
                     cE(rB.Button, {onClick: this.doRegister}, 'Register'),
                     cE(rB.Button, {onClick: this.doCancel}, 'Cancel')
                    )
                 );
    }
}

module.exports = RegisterModal;
