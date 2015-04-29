'use strict';

var CardForm = function(client) {
  var self = this;
  var $cardForm;
  var $textarea;

  $(function() {
    $cardForm = $('#cardform');
    $textarea = $cardForm.find('textarea');

    $cardForm.delegate('#cardtopics button', 'click', self.chooseTopic);
    $cardForm.delegate('#cardtopics button.selected', 'click', self.cancelTopic);
    $cardForm.delegate('button.cancel', 'click', function(e) {
      e.preventDefault();
      client.hideCardForm();
    });
    $cardForm.delegate('button.save', 'click', self.persistCard);
  });

  this.on = function() {
    $cardForm.slideDown('fast');
  };

  this.off = function() {
    $cardForm.slideUp('fast', function() {
      self.cancelTopic();
      $cardForm.find('textarea').val('');
    });
  };

  this.chooseTopic = function(e) {
    $cardForm
      .find('#cardtopics button')
      .not(e.currentTarget)
      .stop(true, true)
      .slideUp('fast')
      .fadeOut('fast');
    $textarea
      .slideDown('fast')
      .focus();

    $(e.currentTarget).addClass('selected');
    e.preventDefault();
  };

  this.cancelTopic = function() {
    $cardForm
      .find('#cardtopics button')
      .removeClass('selected')
      .stop(true, true)
      .slideDown('fast')
      .fadeIn('fast');
    if ($textarea.is(':visible')) {
      $textarea.slideUp('fast');
    }
  };

  this.persistCard = function(e) {
    var card = {
      topic: $cardForm.find('#cardtopics button.selected').val(),
      title: $cardForm.find('textarea').val().trim(),
      author: localStorage.getItem('acclamation.author.name')
    };

    if (card.topic === '' || card.title === '') {
      return false;
    }

    $.post('/cards', {card: card})
      .success(self.done)
      .error(self.error);
    e.preventDefault();
  };

  this.done = function() {
    client.hideCardForm();
  };

  this.error = function(err) {
    console.error(err);
    window.alert('An error occurred.  Refer to the console for more information');
  };
};

module.exports = CardForm;
