const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;
const AppActions = require('../actions/AppActions');
const json_rpc = require('caf_transport').json_rpc;

const APPS = ['root-gadget', 'root-helloworld', 'root-hellosharing',
            'root-turtles','root-helloiot', 'root-hellodiffie',
            'root-hellodynamic', 'root-hellofail', 'root-hellohue',
            'root-hellosleepy','root-hellopresent', 'root-healthypi'];

class AddModal  extends React.Component  {

    constructor(props) {
        super(props);
        this.state = {};
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

    handleAppPublisher() {
        this.setState({appPublisher: this.refs.appPublisher.getValue()});
    }

    handleAppLocalName() {
        this.setState({appLocalName: this.refs.appLocalName.getValue()});
    }

    handleCALocalName() {
        this.setState({caLocalName: this.refs.caLocalName.getValue()});
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
        this.handleCALocalName(ev);
        if (ev.key === 'Enter') {
            this.doAdd(ev);
        }
    }

    onSelect(ev, selectedKey) {
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
                     cE(rB.Modal.Title, null, "New application")
                    ),
                  cE(rB.ModalBody, null,
                     [
                         cE(rB.Input, {
                             key: 53,
                             type: 'text',
                             ref: 'appPublisher',
                             value: this.state.appPublisher,
                             onChange : this.handleAppPublisher,
                             placeholder: 'Enter application publisher'
                         }),
                         cE(rB.Input, {
                             key: 54,
                             type: 'text',
                             ref: 'appLocalName',
                             value: this.state.appLocalName,
                             onChange : this.handleAppLocalName,
                             placeholder: 'Enter application name'
                         }),
                         cE(rB.Input, {
                             key: 55,
                             type: 'text',
                             ref: 'caOwner',
                             readOnly: true,
                             value: (this.props.login &&
                                     this.props.login.caOwner) || ''
                         }),
                         cE(rB.Input, {
                             key:56,
                             type: 'text',
                             ref: 'caLocalName',
                             value: this.state.caLocalName,
                             onChange : this.handleCALocalName,
                             placeholder: 'Enter CA name',
                             onKeyDown: this.submit
                         }),
                         (showCost ?  // 0 days/unit is invalid price
                          cE(rB.Input, {
                              key: 57,
                              type: 'text',
                              ref: 'cost',
                              readOnly: true,
                              value: '' + costValue + ' days/unit' +
                                  ' (subject to change without notice)'
                          }) :
                          null)
                     ].filter(x => !!x)
                    ),
                  cE(rB.Modal.Footer, null,
                     cE(rB.DropdownButton, {
                         onSelect: this.onSelect,
                         title: 'Find'
                     }, APPS.map(function(x, i) {
                         return cE(rB.MenuItem, {
                             key:i*232131,
                             eventKey: x,
                             href: null,
                             target: x
                         }, x);
                     })
                       ),
                     cE(rB.Button, {onClick: this.doCost, bsStyle: 'primary'},
                        "Price?"),
                     cE(rB.Button, {onClick: this.doAdd, bsStyle: 'danger'},
                        "Add")
                    )
                 );
    }
};

module.exports = AddModal;
