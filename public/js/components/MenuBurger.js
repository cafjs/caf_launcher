const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;
const rbm = require('react-burger-menu');
const AppActions = require('../actions/AppActions');

const REMOVE_KEY = 1;
const ADD_KEY = 2;
const DROPDOWN_KEY = 3;
const REGISTER_KEY = 4;
const UNREGISTER_KEY = 5;

const styles = {
    bmBurgerButton: {
        position: 'fixed',
        width: '36px',
        height: '30px',
        left: '36px',
        top: '30px'
    },
    bmBurgerBars: {
        //        background: '#373a47',
        background: '#8B0000',
        opacity: '0.5'
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
         this.stateChange = this.stateChange.bind(this);
         this.addApp = this.addApp.bind(this);
         this.registerApp = this.registerApp.bind(this);
         this.unregisterApp = this.unregisterApp.bind(this);
         this.removeApp = this.removeApp.bind(this);
         this.switchApp = this.switchApp.bind(this);
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
        }  else if (selectedKey === UNREGISTER_KEY) {
            this.closeMenu();
            AppActions.changeUnregisterModal(this.props.ctx, true);
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

    unregisterApp(event) {
        event.preventDefault();
        this.handleSelect(UNREGISTER_KEY);
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
        let navBrand = '#';
        if (this.props.login) {
            navBrand = navBrand  + this.props.login.caOwner +
                '-' + this.props.login.caLocalName;
        }
        const apps = Object.keys(this.props.apps || {});
        return cE(rbm.slide, {styles: styles, right: false,
                                  width: 375,
                                  pageWrapId: 'page-wrap',
                                  outerContainerId: 'outer-container',
                                  isOpen: this.state.menuOpen,
                                  onStateChange: this.stateChange
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
                          onClick: this.addApp
                      },  cE('span', {
                          className: 'glyphicon glyphicon-plus text-success'
                      }), cE('span', null, ' Add CA')),

                      cE('a', {
                          className:  'menu-register-item',
                          key: 121424,
                          onClick: this.registerApp
                      },  cE('span', {
                          className: 'glyphicon glyphicon-pencil text-success'
                      }), cE('span', null, ' Register App')),

                      cE('a', {
                          className:  'menu-remove-item',
                           key: 3312114,
                          onClick: this.removeApp
                      },  cE('span', {
                          className: 'glyphicon  glyphicon-remove text-danger'
                      }), cE('span', null, ' Remove CA')),

                       cE('a', {
                          className:  'menu-unregister-item',
                          key: 1881424,
                          onClick: this.unregisterApp
                      },  cE('span', {
                          className: 'glyphicon glyphicon-pencil text-danger'
                      }), cE('span', null, ' Unregister App')),

                      cE('hr', {key: 43434})
                  ].concat(
                      apps.map((x, i) =>  cE('a', {
                          className: 'menu-item',
                          id: x,
                          key: i*83347 +12934,
                          onClick: this.switchApp
                      }, x))
                  )
                 );
    }
}

module.exports = MenuBurger;
