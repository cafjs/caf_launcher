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
    }

    componentDidMount() {
        this.refs.caOwner && this.refs.caOwner.getInputDOMNode().focus();
    }

    handleModal(isOpen) {
        this.setState({ isModalOpen: isOpen });
    }

    async doLogin(ev) {
        var caOwner = this.refs.caOwner.getValue();
        var caLocalName = this.refs.caLocalName.getValue();
        if (caOwner && caLocalName) {
            await AppSession.connect(this.props.ctx, caOwner, caLocalName);
        } else {
            var err = new Error('Invalid Login: Missing Inputs');
            err.caOwner = caOwner;
            err.caLocalName = caLocalName;
            AppActions.setError(this.props.ctx, err);
        }
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
                             onHide: this.doHide.bind(this),
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
                         onKeyDown: this.keyDown.bind(this)
                     }),
                     cE(rB.Input, {
                         type: 'text',
                         id: 'caLocalName',
                         ref: 'caLocalName',
                         defaultValue: 'desktop1',
                         onKeyDown: this.keyDown.bind(this)
                     })
                    ),
                  cE(rB.Modal.Footer, null,
                     cE(rB.Button, {onClick: this.doLogin.bind(this)},
                        "Login"),
                     cE(rB.Button, {onClick: this.doLogin.bind(this)},
                        "Sign Up")
                    )
                 );
    }
};

module.exports = HelloModal;
