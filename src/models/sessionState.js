'use strict';

var SessionState = function(options) {
  options = options || {};
  this.allowNewCards = options.allowNewCards === true;
  this.allowVoting = options.allowVoting === true;
};

module.exports = SessionState;
