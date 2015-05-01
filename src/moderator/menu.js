'use strict';

var Menu = function(moderator) {
  var self = this;
  var $menu, $links;

  $(function() {
    $menu = $('menu');
    $links = $menu.find('a');

    $(window).resize(self.adapt);
    $menu.delegate('a.session-state', 'click', self.handleStateChange);
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

  this.endSession = function() {
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
