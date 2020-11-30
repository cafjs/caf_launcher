const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;
const AppActions = require('../actions/AppActions');
const json_rpc = require('caf_transport').json_rpc;

const APPS = ['root-gadget', 'root-turtles', 'root-helloworld', 'root-helloiot',
              'root-hellosharing', 'root-hellodiffie',
              'root-hellodynamic', 'root-hellofail', 'root-hellohue',
              'root-hellosleepy','root-hellopresent', 'root-healthypi'];

class AddModal  extends React.Component  {

    constructor(props) {
        super(props);
        this.state = {caLocalName: '', appLocalName: '', appPublisher: ''};
        this.doAdd = this.doAdd.bind(this);
        this.doCost = this.doCost.bind(this);
        this.onSelect = this.onSelect.bind(this);
        this.submit = this.submit.bind(this);
        this.handleCALocalName = this.handleCALocalName.bind(this);
        this.handleAppLocalName = this.handleAppLocalName.bind(this);
        this.handleAppPublisher = this.handleAppPublisher.bind(this);
        this.doHide = this.doHide.bind(this);
    }

    doHide(ev) {
        AppActions.changeAddModal(this.props.ctx, this.props.current, false);
    }

    handleAppPublisher(ev) {
        this.setState({appPublisher: ev.target.value});
    }

    handleAppLocalName(ev) {
        this.setState({appLocalName: ev.target.value});
    }

    handleCALocalName(ev) {
        this.setState({caLocalName: ev.target.value});
    }

    doCost(ev) {
        if ((typeof this.state.appPublisher === 'string') &&
            (typeof this.state.appLocalName === 'string')) {
            const app = json_rpc.joinName(this.state.appPublisher,
                                          this.state.appLocalName);
            AppActions.getAppCost(this.props.ctx, app);
        }
    }

    doAdd(ev) {
        const appPublisher = this.state.appPublisher;
        const appLocalName = this.state.appLocalName;
        const caOwner =  this.props.login.caOwner;
        const caLocalName =  this.state.caLocalName;
        const app = json_rpc
            .joinNameArray([json_rpc.joinName(appPublisher, appLocalName),
                            json_rpc.joinName(caOwner, caLocalName)],
                           json_rpc.APP_SEPARATOR);
        AppActions.setCurrent(this.props.ctx, {
            url : this.props.current.url,
            target: this.props.current.target,
            pending: app
        });
        AppActions.addApp(this.props.ctx, app);
    }

    submit(ev) {
        if (ev.key === 'Enter') {
            ev.preventDefault();
            this.doAdd(ev);
        }
    }

    onSelect(selectedKey) {
        const split = json_rpc.splitName(selectedKey);
        this.setState({appPublisher: split[0]});
        this.setState({appLocalName: split[1]}, this.doCost);
     }

    render() {
        const showCost = this.props.cost &&
              (typeof this.state.appPublisher === 'string') &&
              (typeof this.state.appLocalName === 'string') &&
              (json_rpc.joinName(this.state.appPublisher,
                                 this.state.appLocalName) ===
               this.props.cost.appName);
        const costValue = this.props.cost && this.props.cost.value;

        return cE(rB.Modal, {show: this.props.current.addModal,
                             onHide: this.doHide,
                             animation: false},
                  cE(rB.Modal.Header, {
                      className : "bg-primary text-primary",
                      closeButton: true
                  },
                     cE(rB.Modal.Title, null, "New CA")
                    ),
                  cE(rB.ModalBody, null,
                     cE(rB.Form, {horizontal: true},
                        [
                            cE(rB.FormGroup, {key: 53,
                                              controlId: 'appPublisherId'},
                               cE(rB.Col, {sm: 6, xs: 12},
                                  cE(rB.ControlLabel, null, 'App Publisher')
                                 ),
                               cE(rB.Col, {sm: 6, xs: 12},
                                  cE(rB.FormControl, {
                                      type: 'text',
                                      value: this.state.appPublisher,
                                      onChange: this.handleAppPublisher,
                                      placeholder: 'root'
                                  })
                                 )
                              ),
                            cE(rB.FormGroup, {key: 54,
                                              controlId: 'appLocalNameId'},
                               cE(rB.Col, {sm: 6, xs: 12},
                                  cE(rB.ControlLabel, null, 'App Name')
                                 ),
                               cE(rB.Col, {sm: 6, xs: 12},
                                  cE(rB.FormControl, {
                                      type: 'text',
                                      value: this.state.appLocalName,
                                      onChange: this.handleAppLocalName,
                                      placeholder: 'helloworld'
                                  })
                                 )
                              ),
                            cE(rB.FormGroup, {key: 55,
                                              controlId: 'caOwnerId'},
                               cE(rB.Col, {sm: 6, xs: 12},
                                  cE(rB.ControlLabel, null, 'CA Owner')
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
                            cE(rB.FormGroup, {key: 56,
                                              controlId: 'caLocalNameId'},
                               cE(rB.Col, {sm: 6, xs: 12},
                                  cE(rB.ControlLabel, null, 'CA Name')
                                 ),
                               cE(rB.Col, {sm: 6, xs: 12},
                                  cE(rB.FormControl, {
                                      type: 'text',
                                      value: this.state.caLocalName,
                                      onChange: this.handleCALocalName,
                                      placeholder: 'myhello1',
                                      onKeyPress: this.submit
                                  })
                                 )
                              ),
                            (showCost ?  // 0 days/unit is invalid price
                             cE(rB.FormGroup, {key: 57,
                                               controlId: 'costId'},
                                cE(rB.Col, {sm: 6, xs: 12},
                                  cE(rB.ControlLabel, null, 'Days/unit')
                                  ),
                                cE(rB.Col, {sm: 6, xs: 12},
                                  cE(rB.FormControl, {
                                      type: 'text',
                                      readOnly: true,
                                      value: '' + costValue +
                                          ' -subject to change without notice-'

                                  })
                                 )
                               ) :
                             null)
                        ].filter(x => !!x)
                       )
                    ),
                  cE(rB.Modal.Footer, null,
                     cE(rB.DropdownButton, {
                         onSelect: this.onSelect,
                         id: 'findId',
                         title: 'Find'
                     }, APPS.map((x, i) => cE(rB.MenuItem, {key: i*232131,
                                                            eventKey: x,
                                                            href: null,
                                                            target: x
                                                           }, x)
                                )
                       ),
                     cE(rB.Button, {onClick: this.doCost}, "Price?"),
                     cE(rB.Button, {onClick: this.doAdd, bsStyle: 'danger'},
                        "Add"),
                     cE(rB.Button, {onClick: this.doHide}, 'Cancel')
                    )
                 );
    }
};

module.exports = AddModal;
