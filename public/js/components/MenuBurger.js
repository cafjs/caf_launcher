var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;
var rbm = require('react-burger-menu');
var AppActions = require('../actions/AppActions');

var REMOVE_KEY = 1;
var ADD_KEY = 2;
var DROPDOWN_KEY = 3;
var REGISTER_KEY = 4;

var styles = {
    bmBurgerButton: {
        position: 'fixed',
        width: '36px',
        height: '30px',
        left: '36px',
        top: '30px'
    },
    bmBurgerBars: {
        //        background: '#373a47',
        background: '#8B0000'
    },
    bmCrossButton: {
        height: '24px',
        width: '24px'
    },
    bmCross: {
        background: '#bdc3c7'
    },
    bmMenu: {
        background: '#373a47',
        padding: '1.5em 1.0em 0',
        fontSize: '1.10em'
    },
    bmMorphShape: {
        fill: '#373a47'
    },
    bmItemList: {
        color: '#b8b7ad',
        padding: '0.8em',
        'overflowY': 'auto'
    },
    bmItem: {
        display: 'block',
        margin: '10px'
    },
    bmOverlay: {
        background: 'rgba(0, 0, 0, 0.3)'
    }
};


class MenuBurger extends  React.Component  {

     constructor(props) {
         super(props);
         this.state = {
             menuOpen: false
         };
     }

    handleSelect(selectedKey, pending) {
        if (selectedKey === REMOVE_KEY) {
            this.closeMenu();
            AppActions.changeRemoveModal(this.props.ctx, this.props.current,
                                         true);
        } else if (selectedKey === ADD_KEY) {
            this.closeMenu();
            AppActions.changeAddModal(this.props.ctx, this.props.current, true);
        }  else if (selectedKey === REGISTER_KEY) {
            this.closeMenu();
            AppActions.changeRegisterModal(this.props.ctx, true);
        } else if (pending) {
            this.closeMenu();
            AppActions.setCurrent(this.props.ctx, {
                url : this.props.current.url,
                target: this.props.current.target,
                pending: pending
            });
        } else {
            console.log('Ignoring ' + selectedKey + ' target:' + pending);
        }
    }

    addApp(event) {
        event.preventDefault();
        this.handleSelect(ADD_KEY);
    }

    removeApp(event) {
        event.preventDefault();
        this.handleSelect(REMOVE_KEY);
    }

    registerApp(event) {
        event.preventDefault();
        this.handleSelect(REGISTER_KEY);
    }

    switchApp(event) {
        event.preventDefault();
        this.handleSelect(DROPDOWN_KEY, event.target.id);
    }

    stateChange(state) {
        this.setState({menuOpen: state.isOpen});
    }

    closeMenu () {
        this.setState({menuOpen: false});
    }

    render() {
        //        var navBrand = 'root-launcher';
        var navBrand = '#';
        if (this.props.login) {
            navBrand = navBrand  + this.props.login.caOwner +
                '-' + this.props.login.caLocalName;
        }
        var apps = Object.keys(this.props.apps || {});
        return cE(rbm.scaleDown, {styles: styles, right: false,
                                  width: 375,
                                  pageWrapId: 'page-wrap',
                                  outerContainerId: 'outer-container',
                                  isOpen: this.state.menuOpen,
                                  onStateChange: this.stateChange.bind(this)
                                 },
                  [
                      cE('a', {
                          className: 'menu-heading-item',
                          key: 9883347
                      }, navBrand),
                      cE('hr', {key: 53434}),
                      cE('a', {
                          className:  'menu-add-item',
                          key: 12114,
                          onClick: this.addApp.bind(this)
                      },  cE('span', {
                          className: 'glyphicon glyphicon-plus text-success'
                      }), cE('span', null, ' Add CA')),

                      cE('a', {
                          className:  'menu-register-item',
                          key: 121424,
                          onClick: this.registerApp.bind(this)
                      },  cE('span', {
                          className: 'glyphicon glyphicon-pencil text-success'
                      }), cE('span', null, ' Register App')),

                      cE('a', {
                          className:  'menu-remove-item',
                           key: 3312114,
                          onClick: this.removeApp.bind(this)
                      },  cE('span', {
                          className: 'glyphicon  glyphicon-remove text-danger'
                      }), cE('span', null, ' Remove CA')),
                      cE('hr', {key: 43434})
                  ].concat(
                      apps.map((x, i) =>  cE('a', {
                          className: 'menu-item',
                          id: x,
                          key: i*83347 +12934,
                          onClick: this.switchApp.bind(this)
                      }, x))
                  )
                 );
    }
}

module.exports = MenuBurger;
