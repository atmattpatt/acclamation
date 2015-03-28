'use strict';

var express = require('express');
var router = express.Router();

var EventPublisher = require('../eventPublisher');
var SessionResource = require('../models/sessionResource');
var Card = require('../models/card');
var CardVote = require('../models/cardVote');
var CardRepository = require('../models/card_repository');

var events = new EventPublisher('acclamation:events');

router.get('/', function(req, res) {
  res.redirect('/session');
});

router.get('/moderator/:sessionId', function(req, res) {
  (new SessionResource(req.params.sessionId)).get().then(function(session) {
    res.render('moderator', {session: session});
  }).catch(function() {
    res.redirect('/session');
  });
});

router.get('/client/:sessionId', function(req, res) {
  (new SessionResource(req.params.sessionId)).get().then(function(session) {
    res.render('client');
  }).catch(function() {
    res.redirect('/session');
  });
});

router.get('/cards', function(req, res) {
  (new CardRepository()).all(function(cards) {
    var serializedCards = {};

    for (var i = 0; i < cards.length; i++) {
      serializedCards[cards[i].id] = cards[i].toPlainObject();
    }

    res.json({cards: serializedCards});
  });
});

router.post('/cards', function(req, res) {
  var card = new Card(req.param('card'));
  if (card.isValid()) {
    card.save(function(card) {
      events.publish('card.created', card.toPlainObject());
    });
    res.send(202);
  } else {
    res.send(422);
  }
});

router.post('/cards/:cardId/vote', function(req, res) {
  var cardVote = new CardVote();
  var value = Number(req.param('value'));

  cardVote.increment(req.params.cardId, value, function() {
    var card = new Card();
    card.load(req.params.cardId, function(card) {
      events.publish('card.vote', card.toPlainObject());
    });
  });

  res.send(202);
});

module.exports = router;
