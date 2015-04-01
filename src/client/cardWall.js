'use strict';

var CardWall = function(client) {
  var self = this;
  var $cardWall;

  $(function() {
    $cardWall = $('#cardwall');
  });

  this.initialize = function() {
    self.loadAll().success(self.rendarAll).error(self.error).then(self.socketBind);
  };

  this.on = function() {
    $cardWall.show();
  };

  this.off = function() {
    $cardWall.hide();
  };

  this.loadAll = function() {
    return $.get('/session/' + client.sessionId + '/cards');
  };

  this.renderAll = function(data) {
    $.each(data.cards, function(id, card) {
      self.appendCard(card);
    });
  };

  this.socketBind = function() {
    client.socket.on('card.created', self.appendCard);
    client.socket.on('card.updated', self.updateCard);
    client.socket.on('card.folded', self.foldCard);
  };

  this.appendCard = function(card) {
    var $card = $('<div/>');

    if ($cardWall.find('#card-' + card.id).length > 0) {
      return;
    }

    if (card.parent) {
      return;
    }

    $card.addClass('card')
      .attr('id', 'card-' + card.id)
      .data('card-id', card.id)
      .addClass('card-' + card.topic)
      .html(self.htmlForCard(card))
      .hide();

    $cardWall.append($card);
    $card.fadeIn('fast');
  };

  this.updateCard = function(card) {
    var $card = $('#card-' + card.id);
    $card.html(self.htmlForCard(card));
  };

  this.foldCard = function(card) {
    var $card = $('#card-' + card.id);

    $card.slideUp('fast', function() {
      $card.remove();
    });
  };

  this.error = function(err) {
    console.error(err);
    window.alert('An error occurred.  Refer to the console for more information');
  };

  this.htmlForCard = function(card) {
    var iconMap = {
      'happy': 'fa-smile-o',
      'sad': 'fa-frown-o',
      'idea': 'fa-lightbulb-o',
      'shoutout': 'fa-bullhorn'
    };

    return [
      '<i class="fa fa-2x ',
      iconMap[card.topic],
      '"></i>',
      window.emojiParser(card.title, '/images/emoji') + ' - ' + window.emojiParser(card.author, '/images/emoji'),
      '<span class="vote-badge">', client.voting.signedVotesForCard(card.id), '</span>',
    ].join('');
  };
};

module.exports = CardWall;
