'use strict';

var Temperature = function(defaults) {
  this.values = {};
  this.values['1'] = (defaults.values || {})['1'];
  this.values['2'] = (defaults.values || {})['2'];
  this.values['3'] = (defaults.values || {})['3'];
  this.values['4'] = (defaults.values || {})['4'];
  this.values['5'] = (defaults.values || {})['5'];
};

module.exports = Temperature;
