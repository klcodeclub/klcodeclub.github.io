var path = require('path');
var express = require('express');
var proxy = require('express-http-proxy');

var app = express();

app.use(express.static('public'));

app.use('/.netlify/functions', proxy('http://localhost:9000'));

module.exports = (config, callback) => {
  app.listen(config.port, function() {
    console.log(`\nListening on port ${config.port}!\n`);
    callback();
  });
  return app;
};
