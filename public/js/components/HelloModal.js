var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;
var AppActions = require('../actions/AppActions');
var AppSession = require('../session/AppSession');

class HelloModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isModalOpen: true
        };
        this.doLogin = this.doLogin.bind(this);
        this.doNewAccount = this.doNewAccount.bind(this);
        this.keyDown = this.keyDown.bind(this);
        this.doHide = this.doHide.bind(this);
    }

    componentDidMount() {
        this.refs.caOwner && this.refs.caOwner.getInputDOMNode().focus();
    }

    handleModal(isOpen) {
        this.setState({ isModalOpen: isOpen });
    }

    validUsername(username) {
        return (typeof username === 'string') && (username.length > 1) &&
            (username.match(/^[a-z0-9]+$/) !== null);
    }

    async doLogin(ev, isNewAccount) {
        var caOwner = this.refs.caOwner.getValue();
        var caLocalName = this.refs.caLocalName.getValue();
        if (caOwner && caLocalName && this.validUsername(caOwner) &&
            this.validUsername(caLocalName)) {
            await AppSession.connect(this.props.ctx, caOwner, caLocalName,
                                     isNewAccount);
        } else {
            var err = new Error('Invalid Login: Invalid Inputs: Use only ' +
                                'lowercase ASCII or numbers');
            err.caOwner = caOwner;
            err.caLocalName = caLocalName;
            AppActions.setError(this.props.ctx, err);
        }
    }

    doNewAccount(ev) {
        this.doLogin(ev, true);
    }

    doHide(ev) {
        this.handleModal(false);
    }

    keyDown(ev) {
        if (ev.key === 'Enter') {
            this.doLogin(ev);
        }
    }

    render() {
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
                         onKeyDown: this.keyDown
                     }),
                     cE(rB.Input, {
                         type: 'text',
                         id: 'caLocalName',
                         ref: 'caLocalName',
                         defaultValue: 'desktop1',
                         onKeyDown: this.keyDown
                     })
                    ),
                  cE(rB.Modal.Footer, null,
                     cE(rB.Button, {onClick: this.doLogin},
                        "Login"),
                     cE(rB.Button, {onClick: this.doNewAccount},
                        "Sign Up")
                    )
                 );
    }
};

module.exports = HelloModal;
