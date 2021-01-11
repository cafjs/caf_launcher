const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;
const AppActions = require('../actions/AppActions');
const Slider = require('react-slider').default;

class RegisterModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {plan: 'silver', appLocalName: ''};
        this.doCancel = this.doCancel.bind(this);
        this.doRegister = this.doRegister.bind(this);
        this.handleAppLocalName = this.handleAppLocalName.bind(this);
        this.submit = this.submit.bind(this);
        this.captureRef = React.createRef();
        this.handlePlan = this.handlePlan.bind(this);
        this.handleProfit = this.handleProfit.bind(this);
    }

    componentDidUpdate() {
        if (this.captureRef.current && this.props.register) {
            this.captureRef.current.focus();
        }
    }

    doRegister(ev) {
        AppActions.registerApp(this.props.ctx, this.state.appLocalName,
                               this.state.plan, this.props.profit);
        AppActions.changeRegisterModal(this.props.ctx, false);
    }

    doCancel(ev) {
        AppActions.changeRegisterModal(this.props.ctx, false);
    }

    handleAppLocalName(ev) {
        this.setState({appLocalName: ev.target.value});
    }

    handlePlan(plan) {
        if (plan !== this.state.plan) {
            AppActions.getDaysPerUnit(this.props.ctx, plan, this.props.profit);
        }
        this.setState({plan});
    }

    handleProfit(percent) {
        const profit = percent/100;
        if (Math.abs(profit-this.props.profit) > 0.01) {
            AppActions.getDaysPerUnit(this.props.ctx, this.state.plan, profit);
            AppActions.setLocalState(this.props.ctx, {profit});
        }
    }

    submit(ev) {
        if (ev.key === 'Enter') {
            ev.preventDefault();
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
                     cE(rB.Form, {horizontal: true},
                        cE(rB.FormGroup, {controlId: 'fixedCostId'},
                           cE(rB.Col, {sm: 6, xs: 12},
                              cE(rB.ControlLabel, null, 'Cost of Publishing')
                             ),
                           cE(rB.Col, {sm: 6, xs: 12},
                              cE(rB.FormControl.Static, null,
                                 'One unit every 7 days.'
                                )
                             )
                          ),
                        cE(rB.FormGroup, {controlId: 'appPub2Id'},
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
                        cE(rB.FormGroup, {controlId: 'appLocalName3Id'},
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
                          ),
                        cE(rB.FormGroup, {controlId: 'planId'},
                           cE(rB.Col, {sm: 6, xs: 12},
                              cE(rB.ControlLabel, null, 'Plan')
                             ),
                           cE(rB.Col, {sm: 6, xs: 12},
                              cE(rB.ToggleButtonGroup, {
                                  type: 'radio',
                                  name : 'plan',
                                  value: this.state.plan,
                                  onChange: this.handlePlan
                              },
                                 cE(rB.ToggleButton, {value: 'bronce'},
                                    'Bronce'),
                                 cE(rB.ToggleButton, {value: 'silver'},
                                    'Silver'),
                                 cE(rB.ToggleButton, {value: 'gold'},
                                    'Gold'),
                                 cE(rB.ToggleButton, {value: 'platinum'},
                                    'Platinum')
                                )
                             )
                          ),
                        cE(rB.FormGroup, {controlId: 'profitId'},
                           cE(rB.Col, {sm: 6, xs: 12},
                              cE(rB.ControlLabel, null, 'Profit')
                             ),
                           cE(rB.Col, {sm: 6, xs: 12},
                              cE(Slider, {
                                  className:'horizontal-slider',
                                  thumbClassName: 'example-thumb',
                                  trackClassName: 'example-track',
                                  value: this.props.profit*100,
                                  onAfterChange: this.handleProfit,
                                  min: 0,
                                  max: 90,
                                  renderThumb: (props, state) => {
                                      let val = state.valueNow;
                                      val = Math.trunc(val);
                                      return cE('div', props, val + '%');
                                  }
                              })
                             )
                          ),
                         cE(rB.FormGroup, {controlId: 'priceId'},
                           cE(rB.Col, {sm: 6, xs: 12},
                              cE(rB.ControlLabel, null, 'Price')
                             ),
                            cE(rB.Col, {sm: 6, xs: 12},
                               cE(rB.FormControl, {
                                   type: 'text',
                                   readOnly: true,
                                   value: '' + this.props.price + ' days/unit'
                               })
                              )
                           )
                       )
                    ),
                  cE(rB.Modal.Footer, null,
                     cE(rB.Button, {onClick: this.doRegister,
                                    bsStyle: 'danger'}, 'Register'),
                     cE(rB.Button, {onClick: this.doCancel}, 'Cancel')
                    )
                 );
    }
}

module.exports = RegisterModal;
