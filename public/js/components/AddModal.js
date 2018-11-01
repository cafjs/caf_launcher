var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;
var AppActions = require('../actions/AppActions');
var json_rpc = require('caf_transport').json_rpc;

var APPS = ['root-gadget', 'root-helloworld', 'root-hellosharing',
            'root-turtles','root-helloiot', 'root-hellodiffie',
            'root-hellodynamic', 'root-hellofail', 'root-hellolambda',
            'root-hellosleepy','root-hellopresent', 'root-bodysnatcher'];

class AddModal  extends React.Component  {

    constructor(props) {
        super(props);
        this.state = {};
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

    doAdd(ev) {
        var appPublisher = this.state.appPublisher;
        var appLocalName = this.state.appLocalName;
        var caOwner =  this.props.login.caOwner;
        var caLocalName =  this.state.caLocalName;
        var app = json_rpc
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
        var split = json_rpc.splitName(selectedKey);
        this.setState({appPublisher: split[0]});
        this.setState({appLocalName: split[1]});
    }

    render() {
        return cE(rB.Modal, {show: this.props.current.addModal,
                             onHide: this.doHide.bind(this),
                             animation: false},
                  cE(rB.Modal.Header, {
                      className : "bg-primary text-primary",
                      closeButton: true
                  },
                     cE(rB.Modal.Title, null, "New application")
                    ),
                  cE(rB.ModalBody, null,
                     cE(rB.Input, {
                         type: 'text',
                         ref: 'appPublisher',
                         value: this.state.appPublisher,
                         onChange : this.handleAppPublisher.bind(this),
                         placeholder: 'Enter application publisher'
                     }),
                     cE(rB.Input, {
                         type: 'text',
                         ref: 'appLocalName',
                         value: this.state.appLocalName,
                         onChange : this.handleAppLocalName.bind(this),
                         placeholder: 'Enter application name'
                     }),
                     cE(rB.Input, {
                         type: 'text',
                         ref: 'caOwner',
                         readOnly: true,
                         value: (this.props.login &&
                                 this.props.login.caOwner) || ''
                     }),
                     cE(rB.Input, {
                         type: 'text',
                         ref: 'caLocalName',
                         value: this.state.caLocalName,
                         onChange : this.handleCALocalName.bind(this),
                         placeholder: 'Enter CA name',
                         onKeyDown: this.submit.bind(this)
                     })
                    ),
                  cE(rB.Modal.Footer, null,
                     cE(rB.DropdownButton, {
                         onSelect: this.onSelect.bind(this),
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
                     cE(rB.Button, {onClick: this.doAdd.bind(this)}, "Add")
                    )
                 );
    }
};

module.exports = AddModal;
