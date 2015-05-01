'use strict';

var Voting = function(client) {
  var self = this;
  var $voteHeader;
  var $voteStatus;
  var MAX_VOTES = 3;

  this.clickTimer = null;

  $(function() {
    $voteHeader = $('#voteheader');
    $voteStatus = $('#votestatus');
  });

  this.on = function() {
    self.updateStatus();
    $voteHeader.slideDown('fast');
    self.bindEvents();
  };

  this.off = function() {
    $voteHeader.slideUp('fast');
    self.unbindEvents();
  };

  this.bindEvents = function() {
    self.unbindEvents();
    $('#cardwall').delegate('.card', 'tap', self.vote);
    $('#cardwall').delegate('.card', 'doubletap', self.unvote);
  };

  this.unbindEvents = function() {
    $('#cardwall').undelegate('.card', 'tap');
    $('#cardwall').undelegate('.card', 'doubletap');
  };

  this.vote = function(e) {
    var $card = $(this);

    self.clickTimer = setTimeout(function() {
      if (self.clickTimer === null) {
        return;
      }

      console.log('Received vote for', $card);
      if (self.votesCast() >= MAX_VOTES) {
        window.alert('You have already used all ' + MAX_VOTES + ' of your votes');
        return;
      }

      self.saveVote($card, 1);
    }, 250);
  };

  this.unvote = function(e) {
    var $card = $(this);
    var votesForCard = self.votesForCard($card.data('card-id'));
    clearTimeout(self.clickTimer);
    self.clickTimer = null;

    if (votesForCard > 0) {
      console.log('Received unvote for', $card);
      self.saveVote($card, -1);
    }
  };

  this.saveVote = function($card, value) {
    var cardId = $card.data('card-id');
    $.post('/session/' + client.sessionId + '/cards/' + cardId + '/vote', {value: value}).success(function() {
      self.updateVoteMap($card, value);
    });
  };

  this.updateVoteMap = function($card, value) {
    var cardId = $card.data('card-id');
    var voteMap = self.getVoteMap();

    voteMap[cardId] = voteMap[cardId] || 0;
    voteMap[cardId] = self.votesForCard(cardId) + value;

    self.saveVoteMap(voteMap);

    $card.find('.vote-badge').text(self.signedVotesForCard(cardId));

    self.updateStatus();
  };

  this.updateStatus = function() {
    $voteStatus.text((MAX_VOTES - self.votesCast()) + ' votes left');
  };

  this.votesCast = function() {
    var voteMap = self.getVoteMap();
    var votesCast = 0;
    $.each(voteMap, function(cardId, votes) {
      votesCast += votes;
    });
    return votesCast;
  };

  this.getVoteMap = function() {
    var voteMap = localStorage.getItem('acclamation.session[' + client.sessionId + '].voting.voteMap');
    if (voteMap) {
      try { return JSON.parse(voteMap); } catch (_) {}
    }
    return {};
  };

  this.saveVoteMap = function(voteMap) {
    localStorage.setItem('acclamation.session[' + client.sessionId + '].voting.voteMap', JSON.stringify(voteMap));
  };

  this.votesForCard = function(cardId) {
    var voteMap = self.getVoteMap();
    return (voteMap[cardId] || 0);
  };

  this.signedVotesForCard = function(cardId) {
    var votes = self.votesForCard(cardId);
    if (votes > 0) {
      return ['+', votes].join('');
    } else if (votes < 0) {
      return votes;
    } else {
      return '';
    }
  };

  this.sessionStateChanged = function(state) {
    client.showCardWall();
  };
};

module.exports = Voting;
