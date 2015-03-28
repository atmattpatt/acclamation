'use strict';

var express = require('express');
var router = express.Router();
var EventPublisher = require('../eventPublisher');
var SessionResource = require('../models/sessionResource');
var SessionExport = require('../models/sessionExport');

var events = new EventPublisher('acclamation:events');

router.get('/', function(req, res) {
  res.render('session/index');
});

router.get('/start', function(req, res) {
  (new SessionResource()).create().then(function(session) {
    res.redirect('/moderator/' + session.id);
  });
});

router.get('/:sessionId/qr_code', function(req, res) {
  (new SessionResource(req.params.sessionId)).get().then(function(session) {
    var qr = session.qr();
    res.type('image/png');
    qr.on('data', function(chunk) {
      res.write(chunk);
    });
    qr.on('end', function() {
      res.end();
    });
  }).catch(function() {
    res.send(404);
  });
});

router.get('/:sessionId/export', function(req, res) {
  (new SessionResource(req.params.sessionId)).get().then(function(session) {
    (new SessionExport(function(exportData) {
      var today = new Date();
      var filename = 'acclamation_session_' +
        today.getFullYear() + '-' +
        (today.getMonth() < 9 ? '0' : '') + (today.getMonth() + 1) + '-' +
        (today.getDate() < 10 ? '0' : '') + today.getDate() + '.json';

      res.attachment(filename);
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(exportData), 'utf8');
    }));
  }).catch(function() {
    res.send(404);
  });
});

router.get('/:sessionId/end', function(req, res) {
  (new SessionResource(req.params.sessionId)).get().then(function(session) {
    res.render('session/end', {session: session});
  }).catch(function() {
    res.send(404);
  });
});

router.get('/:sessionId/destroy', function(req, res) {
  (new SessionResource(req.params.sessionId)).get().then(function(session) {
    session.destroy().then(function() {
      res.redirect('/session');
    });
  }).catch(function() {
    res.send(404);
  });
});

router.get('/:sessionId/state', function(req, res) {
  (new SessionResource(req.params.sessionId)).sessionState().get().then(function(state) {
    res.json(state);
  }).catch(function() {
    res.send(404);
  });
});

router.post('/:sessionId/state', function(req, res) {
  var sessionResource = new SessionResource(req.params.sessionId);
  sessionResource.sessionState().update({
    allowNewCards: req.param('allowNewCards'),
    allowVoting: req.param('allowVoting')
  }).then(function(state) {
    events.publish('sessionState.changed', state);
    res.send(202);
  }).catch(function() {
    res.send(404);
  });
});

router.get('/:sessionId/temperature', function(req, res) {
  (new SessionResource(req.params.sessionId)).temperature().get().then(function(temperature) {
    res.json(temperature.values);
  }).catch(function() {
    res.send(404);
  });
});

router.post('/:sessionId/temperature/vote/:value', function(req, res) {
  var sessionResource = new SessionResource(req.params.sessionId);
  sessionResource.temperature().get().then(function(temperature) {
    sessionResource.temperature().get().then(function() {
      events.publish('temperature', temperature.getValues());
    });
    res.send(202);
  }).catch(function() {
    res.send(404);
  });
});

router.post('/:sessionId/cards/:cardId', function(req, res) {
  (new SessionResource(req.params.sessionId)).card(req.params.cardId).update({
    title: req.param('title')
  }).then(function (card) {
    events.publish('card.updated', card);
  });

  res.send(202);
});

router.post('/:sessionId/cards/:cardId/fold', function(req, res) {
  (new SessionResource(req.params.sessionId)).card(req.params.cardId).update({
    type: 'child-card',
    parent: req.param('parent')
  }).then(function (card) {
    events.publish('card.folded', card);
  });

  res.send(202);
});

module.exports = router;
