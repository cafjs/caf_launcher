const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;
const AppActions = require('../actions/AppActions');
const MESSAGE =
`Keeping the token in the URL is convenient but insecure.

Clear the browsing history and only use trusted devices!
`;

class WarnKeepToken extends React.Component {

    constructor(props) {
        super(props);
        this.doHide = this.doHide.bind(this);
    }

    doHide(ev) {
        AppActions.setLocalState(this.props.ctx, {warnKeepToken: false});
    }

    render() {
        return cE(rB.Modal, {show: this.props.warnKeepToken,
                             onHide: this.doHide,
                             animation: false},
                  cE(rB.Modal.Header, {
                         className : "bg-warning text-warning",
                         closeButton: true
                     },
                     cE(rB.Modal.Title, null, "Warning")
                    ),
                  cE(rB.Modal.Body, null,
                     cE(rB.Alert, {bsStyle: 'danger', style:
                                   {wordWrap: "break-word"}},
                        MESSAGE
                       )
                    ),
                  cE(rB.Modal.Footer, null,
                     cE(rB.Button, {onClick: this.doHide}, "Dismiss")
                    )
                 );
    }
};

module.exports = WarnKeepToken;
