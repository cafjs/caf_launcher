var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;

var ListDropdown = {
    render: function() {
        var apps = Object.keys(this.props.apps || {});

        return cE(rB.DropdownButton, {
                      onSelect: this.props.onSelect,
                      eventKey: null,
                      navItem: true,
                      title: cE('span', {
                                  className: 'glyphicon glyphicon-list-alt text-success'
                                })
                  }, apps.map(function(x, i) {
                                  return cE(rB.MenuItem, {
                                                key:i*3232131,
                                                eventKey: x,
                                                href: null,
                                                target: x
                                            }, x);
                              })
                 );
    }
};

module.exports = React.createClass(ListDropdown);
