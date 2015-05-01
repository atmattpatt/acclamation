'use strict';

var Temperature = function(client) {
  var self = this;
  var $temperature;

  $(function() {
    $temperature = $('#temperature');
  });

  this.on = function() {
    $temperature.show();
    $temperature.delegate('button', 'click', self.vote);
  };

  this.off = function() {
    $temperature.hide();
  };

  this.vote = function() {
    var value = $(this).val();
    $.post('/session/' + client.sessionId + '/temperature/vote/' + value)
      .success(self.done)
      .error(self.error);
  };

  this.done = function() {
    self.recordVote();
    client.showAuthor();
  };

  this.error = function(err) {
    console.error(err);
    window.alert('An error occurred.  Refer to the console for more information');
  };

  this.recordVote = function() {
    localStorage.setItem('acclamation.session[' + client.sessionId + '].temperature.hasVoted', true);
  };

  this.hasVoted = function() {
    return localStorage.getItem('acclamation.session[' + client.sessionId + '].temperature.hasVoted') === 'true';
  };
};

module.exports = Temperature;
