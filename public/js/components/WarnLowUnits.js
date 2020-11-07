const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;
const AppActions = require('../actions/AppActions');

class WarnLowUnits extends React.Component {

    constructor(props) {
        super(props);
        this.doHide = this.doHide.bind(this);
    }

    doHide(ev) {
        AppActions.setLocalState(this.props.ctx, {enableWarnLowUnits: false});
    }

    render() {
        const show = this.props.enableWarnLowUnits &&
            (typeof this.props.units === 'number') &&
            (this.props.units >= 0) && (this.props.units <= 2);

        return cE(rB.Modal, {show: show,
                             onHide: this.doHide,
                             animation: false},
                  cE(rB.Modal.Header, {
                         className : "bg-warning text-warning",
                         closeButton: true
                     },
                     cE(rB.Modal.Title, null, 'Low units')
                    ),
                  cE(rB.Modal.Body, null,
                     cE(rB.Alert, {bsStyle: 'danger', style:
                                   {wordWrap: 'break-word'}},
                        `You have ${this.props.units} units left.` +
                        " You can add more units with the 'people' app."
                       )
                    ),
                  cE(rB.Modal.Footer, null,
                     cE(rB.Button, {onClick: this.doHide}, "Dismiss")
                    )
                 );
    }
};

module.exports = WarnLowUnits;
