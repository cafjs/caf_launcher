var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;
var cli = require('caf_cli');
var json_rpc = require('caf_transport').json_rpc;
var crypto = require('crypto');
var AppActions = require('../actions/AppActions');


class Iframe extends React.Component {

    constructor(props) {
        super(props);
        this.state = {invCacheCounter: 0};
    }

    updateIFrame() {
        if (this.props.current.pending &&
            (this.props.current.target !== this.props.current.pending) &&
            (this.props.apps[this.props.current.pending])) {
            // we always delay url update until we have a token.
            var split = json_rpc.splitName(this.props.current.pending,
                                           json_rpc.APP_SEPARATOR);
            var app = json_rpc.splitName(split[0]);
            var ca = json_rpc.splitName(split[1]);

            var cacheKey = this.props.cacheKeys[this.props.current.pending];
            if (!cacheKey) {
                cacheKey = Buffer.from(crypto.randomBytes(15))
                    .toString('base64');
                AppActions.setCacheKey(this.props.ctx,
                                       this.props.current.pending,
                                       cacheKey);
            }
            var options = {
                appPublisher: app[0],
                appLocalName: app[1],
                caOwner: ca[0],
                caLocalName: ca[1],
                token: this.props.apps[this.props.current.pending],
                session: 'default',
                cacheKey: cacheKey
            };

            // mostly for demo
            if (this.props.disableCache) {
                options.cacheKey = this.state.invCacheCounter;
                this.state.invCacheCounter = this.state.invCacheCounter + 1;
            }

            var url = cli.patchURL(window.location.href, options);
            AppActions.setCurrent(this.props.ctx,
                                  { url: url,
                                    target: this.props.current.pending});
        }
    };

    componentDidUpdate(prevProps) {

        if (this.props.current.pending && prevProps.current && prevProps.apps &&
            ((this.props.current.target !== prevProps.current.target) ||
             (this.props.current.pending !== prevProps.current.pending) ||
             (this.props.apps[this.props.current.pending] !==
              prevProps.apps[this.props.current.pending]))) {
            console.log('Updating iframe');
            this.updateIFrame();
        }
    }

    render() {
        return cE('iframe', {
            id: 'page-wrap',
            allow: 'camera; microphone',
            // disable top-navigation
            sandbox:'allow-same-origin allow-popups allow-scripts allow-forms allow-pointer-lock allow-modals',
            className: 'iframe-fit',
            frameBorder: 0,
            src: this.props.current.url
        }, null);
    }
}

module.exports = Iframe;
