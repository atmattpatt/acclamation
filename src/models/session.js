'use strict';

var config = require('../config');
var qr = require('qr-image');

var Session = function(defaults) {
  this.id = defaults.id;
  this.name = defaults.name;
};

Session.prototype.qr = function() {
  return qr.image(config.server.baseUrl + '/client/' + this.id, { type: 'png', size: 8 });
};

module.exports = Session;
