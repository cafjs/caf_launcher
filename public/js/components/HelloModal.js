const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;
const AppActions = require('../actions/AppActions');
const AppSession = require('../session/AppSession');
const NOBODY_USER = 'nobody';
const NOBODY_CA = 'unknown';
const DESKTOPS = ['desktop1', 'desktop2', 'desktop3', 'desktop4'];

class HelloModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isModalOpen: true,
            caLocalName: 'desktop1',
            caOwner: ''
        };
        this.handleCAOwner = this.handleCAOwner.bind(this);
        this.onSelect = this.onSelect.bind(this);
        this.doLogin = this.doLogin.bind(this);
        this.doLoginCommon = this.doLoginCommon.bind(this);
        this.doNewAccount = this.doNewAccount.bind(this);
        this.keyDown = this.keyDown.bind(this);
        this.doHide = this.doHide.bind(this);
        this.handleKeepToken = this.handleKeepToken.bind(this);
        this.doForgot = this.doForgot.bind(this);
        this.captureRef = React.createRef();
        this.firstUpdate = true;
    }

    componentDidUpdate() {
        if (this.captureRef.current && (this.props.login === null) &&
            this.firstUpdate) {
            this.captureRef.current.focus();
            this.firstUpdate = false;
        }
    }

    handleCAOwner(ev) {
        this.setState({caOwner: ev.target.value});
    }

    onSelect(caLocalName) {
        this.setState({caLocalName});
    }

    handleModal(isOpen) {
        this.setState({isModalOpen: isOpen});
    }

    handleKeepToken(e) {
        const keepToken = e.target.checked;
        if (!this.props.keepToken && keepToken) {
            AppActions.setLocalState(this.props.ctx, {warnKeepToken: true});
        }
        AppActions.setLocalState(this.props.ctx, {keepToken});
    }

    validUsername(username) {
        return (typeof username === 'string') && (username.length > 2) &&
            (username.match(/^[a-z0-9]+$/) !== null);
    }

    async doLoginCommon(isNewAccount) {
        const caOwner = this.state.caOwner;
        const caLocalName = this.state.caLocalName;
        if (caOwner && caLocalName && this.validUsername(caOwner) &&
            this.validUsername(caLocalName)) {
            await AppSession.connect(this.props.ctx, caOwner, caLocalName,
                                     isNewAccount, this.props.keepToken);
        } else {
            const err = new Error(
                'Invalid username: lowercase ASCII or numbers only ' +
                    '(3+ characters)'
            );
            err.caOwner = caOwner;
            err.caLocalName = caLocalName;
            AppActions.setError(this.props.ctx, err);
        }
    }

    async doForgot(ev) {
        await AppSession.connect(this.props.ctx, NOBODY_USER, NOBODY_CA);
    }

    doLogin(ev) {
        this.doLoginCommon(false);
    }

    doNewAccount(ev) {
        this.doLoginCommon(true);
    }

    doHide(ev) {
        this.handleModal(false);
    }

    keyDown(ev) {
        if (ev.key === 'Enter') {
            ev.preventDefault();
            this.doLogin(ev);
        }
    }

    render() {
        const shouldRender = (this.props.login === null);

        return cE(rB.Modal, {show: shouldRender && this.state.isModalOpen,
                             onHide: this.doHide,
                             animation: false},
                  cE(rB.Modal.Header, {
                         className : 'bg-primary text-primary',
                         closeButton: true
                     },
                     cE(rB.Modal.Title, null, 'Welcome to Caf.js!')
                    ),
                  cE(rB.Modal.Body, null,
                     cE(rB.Form, {horizontal: true},
                        cE(rB.FormGroup, {controlId: 'usernameId'},
                           cE(rB.Col, {sm: 5, xs: 12},
                              cE(rB.ControlLabel, null, 'Username')
                             ),
                           cE(rB.Col, {sm: 4, xs: 12},
                              cE(rB.FormControl, {
                                  type: 'text',
                                  value: this.state.caOwner,
                                  onChange: this.handleCAOwner,
                                  placeholder: 'john123',
                                  onKeyPress: this.keyDown,
                                  inputRef: this.captureRef
                              })
                             )
                          ),
                        cE(rB.FormGroup, {controlId: 'desktopId'},
                           cE(rB.Col, {sm: 5, xs: 12},
                              cE(rB.ControlLabel, null, 'Desktop')
                             ),
                           cE(rB.Col, {sm: 4, xs: 8},
                              cE(rB.FormControl, {
                                  type: 'text',
                                  readOnly: true,
                                  value: this.state.caLocalName,
                                  onKeyPress: this.keyDown
                              })
                             ),
                           cE(rB.Col, {sm: 2, xs: 4},
                              cE(rB.DropdownButton, {
                                  onSelect: this.onSelect,
                                  id: 'selectId',
                                  title: 'Change'
                              }, DESKTOPS.map((x, i) => cE(rB.MenuItem, {
                                  key: i*23131,
                                  eventKey: x,
                                  target: x
                              }, x))
                                )
                             )
                          ),
                        cE(rB.FormGroup, {controlId: 'keepTokenId'},
                           cE(rB.Col, {sm: 3, xs: 12},
                              cE(rB.ControlLabel, null, 'Keep Token')
                             ),
                           cE(rB.Col, {sm: 2, xs: 4},
                              cE(rB.Checkbox, {
                                  checked: this.props.keepToken,
                                  onChange: this.handleKeepToken
                              })
                             )
                          )
                       )
                    ),
                  cE(rB.Modal.Footer, null,
                     cE(rB.ButtonGroup, null,
                        cE(rB.Button, {
                            bsStyle: 'link',
                            onClick: this.doForgot
                        }, 'Forgot username?'),
                        cE(rB.Button, {
                            onClick: this.doNewAccount
                        }, 'Sign Up'),
                        cE(rB.Button, {bsStyle: 'primary',
                                       onClick: this.doLogin},
                           'Login')
                       )
                    )
                 );
    }
};

module.exports = HelloModal;
