'use strict';

var express = require('express');
var router = express.Router();
var EventPublisher = require('../eventPublisher');
var Session = require('../models/session');
var SessionExport = require('../models/sessionExport');
var SessionState = require('../models/sessionState');

var events = new EventPublisher('acclamation:events');

router.get('/', function(req, res) {
  res.render('session/index');
});

router.get('/start', function(req, res) {
  (new Session()).create().then(function(session) {
    res.redirect('/moderator/' + session.id());
  });
});

router.get('/:sessionId/qr_code', function(req, res) {
  (new Session()).find(req.params.sessionId).then(function(session) {
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
  (new Session()).find(req.params.sessionId).then(function(session) {
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
  (new Session()).find(req.params.sessionId).then(function(session) {
    res.render('session/end', {session: session});
  });
});

router.get('/:sessionId/destroy', function(req, res) {
  (new Session()).find(req.params.sessionId).then(function(session) {
    session.destroy().then(function() {
      res.redirect('/session');
    });
  });
});

router.get('/state', function(req, res) {
  (new SessionState()).load(function(state) {
    res.json(state.toPlainObject());
  });
});

router.post('/state', function(req, res) {
  (new SessionState()).load(function(state) {
    state.allowNewCards = req.param('allowNewCards', state.allowNewCards);
    state.allowVoting = req.param('allowVoting', state.allowVoting);
    state.save(function(state) {
      events.publish('sessionState.changed', state.toPlainObject());
    });
  });

  res.send(202);
});

module.exports = router;
