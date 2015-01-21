'use strict';

var express = require('express');
var router = express.Router();

var EventPublisher = require('../eventPublisher');
var Session = require('../models/session');
var Temperature = require('../models/temperature');
var Card = require('../models/card');
var CardVote = require('../models/cardVote');
var CardRepository = require('../models/card_repository');

var events = new EventPublisher('acclamation.events');

router.get('/', function(req, res) {
  res.redirect('/session/new');
});

router.get('/moderator/:sessionId', function(req, res) {
  (new Session()).load(function(session) {
    if (session.id() === null) {
      res.redirect('/session/new');
    } else if (session.id() !== req.params.sessionId) {
      res.redirect('/session/new');
    } else {
      res.render('moderator');
    }
  });
});

router.get('/client/:sessionId', function(req, res) {
  (new Session()).load(function(session) {
    if (session.id() === null) {
      res.redirect('/session/new');
    } else if (session.id() !== req.params.sessionId) {
      res.redirect('/session/new');
    } else {
      res.render('client');
    }
  });
});

router.get('/temperature', function(req, res) {
  (new Temperature()).load(function(temperature) {
    res.json(temperature.getValues());
  });
});

router.post('/temperature/vote/:value', function(req, res) {
  (new Temperature()).increment(req.params.value, function(temperature) {
    temperature.load(function(temperature) {
      events.publish('temperature', temperature.getValues());
    });
  });

  res.send(202);
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

router.post('/cards/:cardId', function(req, res) {
  var card = new Card();
  card.load(req.params.cardId, function(card) {
    card.title = req.param('title');
    card.save(function(card) {
      events.publish('card.updated', card.toPlainObject());
    });
  });

  res.send(202);
});

router.post('/cards/:cardId/fold', function(req, res) {
  var card = new Card();
  card.load(req.params.cardId, function(card) {
    card.type = 'child-card';
    card.parent = req.param('parent');
    card.save(function(card) {
      events.publish('card.folded', card.toPlainObject());
    });
  });

  res.send(202);
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
