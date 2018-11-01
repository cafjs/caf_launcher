var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;

var DROPDOWN_KEY = 3;

class  ListDropdown extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        var self = this;
        var apps = Object.keys(this.props.apps || {});

        return cE(rB.NavDropdown, {
            id : 'basic-navbar-dropdown',
            key: 323232,
            eventKey: DROPDOWN_KEY,
            defaultOpen: this.props.defaultOpen,
            title: cE('span', {
                className: 'glyphicon glyphicon-list-alt text-success'
            })
        }, apps.map(function(x, i) {
            return cE(rB.MenuItem, {
                onSelect: self.props.onSelect,
                key:i*3232131,
                eventKey: x
            }, cE('p', null, x));
        }));
    }
};

module.exports = ListDropdown;
