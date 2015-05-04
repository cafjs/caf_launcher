// use app.js directly for server side rendering
if (typeof window !== 'undefined') {
    var app = require('./app');
    app.main();
};
