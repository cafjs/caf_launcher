var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;
var AppActions = require('../actions/AppActions');
var AppsListDropdown = require('./AppsListDropdown');

var REMOVE_KEY = 1;
var ADD_KEY = 2;


class MenuNavbar extends  React.Component  {

     constructor(props) {
        super(props);
     }

    handleSelect(selectedKey, pending) {
        if (selectedKey === REMOVE_KEY) {
            AppActions.changeRemoveModal(this.props.ctx, this.props.current,
                                         true);
        } else if (selectedKey === ADD_KEY) {
            AppActions.changeAddModal(this.props.ctx, this.props.current, true);
        } else if (pending) {
            AppActions.setCurrent(this.props.ctx, {
                url : this.props.current.url,
                target: this.props.current.target,
                pending: pending
            });
        } else {
            console.log('Ignoring ' + selectedKey + ' target:' + pending);
        }
    }

    render() {
        var navBrand = 'root-launcher';
        if (this.props.login) {
            navBrand = navBrand + '#' + this.props.login.caOwner +
                '-' + this.props.login.caLocalName;
        }
        return cE(rB.Navbar, { inverse: true, collapseOnSelect: true},
                  cE(rB.Navbar.Header, null,
                     cE(rB.Navbar.Brand, {}, navBrand),
                     cE(rB.Navbar.Toggle)
                    ),
                  cE(rB.Navbar.Collapse, null,
                     cE(rB.Nav, { pullRight:true,
                                  eventKey:0,
                                  onSelect: this.handleSelect.bind(this)
                                },
                        cE(rB.NavItem, { eventKey: REMOVE_KEY },
                           cE('span', {
                               className:
                               'glyphicon glyphicon-remove text-danger'
                           })),
                        cE(rB.NavItem, { eventKey: ADD_KEY},
                           cE('span', {
                               className:
                               'glyphicon glyphicon-plus text-success'
                           })),
                        cE(AppsListDropdown, {
                            onSelect: this.handleSelect.bind(this),
                            apps: this.props.apps,
                            defaultOpen:
                            ((this.props.current.target == null) &&
                             (Object.keys(this.props.apps).length > 0))
                        })
                       )
                    )
                 );
    }
}

module.exports = MenuNavbar;
