const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;
const AppActions = require('../actions/AppActions');
const MESSAGE =
`Deleting the state of an app instance cannot be undone.

Adding its name again will create a fresh one.
`;

class WarnDestroy extends React.Component {

    constructor(props) {
        super(props);
        this.doHide = this.doHide.bind(this);
    }

    doHide(ev) {
        AppActions.setLocalState(this.props.ctx, {warnDestroy: false});
    }

    render() {
        return cE(rB.Modal, {show: this.props.warnDestroy,
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

module.exports = WarnDestroy;
