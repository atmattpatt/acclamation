'use strict';

var Menu = function(moderator) {
  var self = this;
  var $menu, $links;

  $(function() {
    $menu = $('menu');
    $links = $menu.find('a');

    $(window).resize(self.adapt);
    $menu.delegate('a.session-state', 'click', self.handleStateChange);
    $menu.delegate('a.moderator-state', 'click', self.handleLocalStateChange);
    self.hideVotes();
  });

  this.initialize = function() {
    self.loadState()
      .then(self.setState)
      .then(self.socketBind)
      .then(self.adapt);
  };

  this.loadState = function() {
    return $.get('/session/' + moderator.sessionId + '/state');
  };

  this.socketBind = function() {
    moderator.socket.on('sessionState.changed', self.setState);
  };

  this.setState = function(state) {
    if (state.allowNewCards) {
      self.openToNewCards();
    } else {
      self.closeToNewCards();
    }

    if (state.allowVoting) {
      self.openVoting();
    } else {
      self.closeVoting();
    }
  };

  this.handleStateChange = function(e) {
    var $link = $(e.target);
    var params = {};
    params[$link.attr('rel')] = $link.attr('data-state');
    $.post('/session/' + moderator.sessionId + '/state', params);
  };

  this.handleLocalStateChange = function(e) {
    var $link = $(e.target);
    var state = $link.attr('data-state');
    var fn;

    switch($link.attr('rel')) {
      case 'showVotes':
        fn = (state === 'true') ? self.showVotes : self.hideVotes;
        break;
    }
    fn();
  };

  this.adapt = function() {
    var height = $(window).height();
    var $menu = $('menu');

    $menu.show().css('top', height - $menu.outerHeight());
  };

  this.closeToNewCards = function() {
    self.toggleLinks('allowNewCards', 'true');
  };

  this.openToNewCards = function() {
    self.toggleLinks('allowNewCards', 'false');
  };

  this.closeVoting = function() {
    self.toggleLinks('allowVoting', 'true');
  };

  this.openVoting = function() {
    self.toggleLinks('allowVoting', 'false');
  };

  this.hideVotes = function() {
    self.toggleLinks('showVotes', 'true');
    moderator.cardWall.setVoting(false);
  };

  this.showVotes = function() {
    self.toggleLinks('showVotes', 'false');
    moderator.cardWall.setVoting(true);
  };

  this.toggleLinks = function(rel, state) {
    $links.filter('[rel="' + rel + '"]').each(function() {
      var $link = $(this);
      if ($link.attr('data-state') === state) {
        $link.show();
      } else {
        $link.hide();
      }
    });
  };
};

module.exports = Menu;
