'use strict';

var Author = function(client) {
  var self = this;
  var $author;

  $(function() {
    $author = $('#author');
  });

  this.on = function() {
    $author.show();
    $author.delegate(':submit', 'click', self.submit);
  };

  this.off = function() {
    $author.hide();
  };

  this.submit = function() {
    var value = $('#card_author').val();

    if (value === '') {
      value = 'Anonymous';
    }

    localStorage.setItem('acclamation.session[' + client.sessionId + '].author.name', value);
    client.initSession();
  };

  this.hasProvided = function() {
    return localStorage.getItem('acclamation.session[' + client.sessionId + '].author.name') !== null;
  };
};

module.exports = Author;
