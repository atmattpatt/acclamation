'use strict';

var express = require('express');
var router = express.Router();
var EventPublisher = require('../eventPublisher');
var SessionResource = require('../models/sessionResource');
var SessionExport = require('../models/sessionExport');
var SessionStateResource = require('../models/sessionStateResource');
var TemperatureResource = require('../models/temperatureResource');

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
  (new SessionResource()).find(req.params.sessionId).then(function(session) {
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
  (new SessionResource()).find(req.params.sessionId).then(function(session) {
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
  (new SessionResource()).find(req.params.sessionId).then(function(session) {
    res.render('session/end', {session: session});
  }).catch(function() {
    res.send(404);
  });
});

router.get('/:sessionId/destroy', function(req, res) {
  (new SessionResource()).find(req.params.sessionId).then(function(session) {
    session.destroy().then(function() {
      res.redirect('/session');
    });
  }).catch(function() {
    res.send(404);
  });
});

router.get('/:sessionId/state', function(req, res) {
  (new SessionResource()).find(req.params.sessionId).then(function(session) {
    (new SessionStateResource(session)).fetch().then(function(state) {
      res.json(state);
    });
  }).catch(function() {
    res.send(404);
  });
});

router.post('/:sessionId/state', function(req, res) {
  (new SessionResource()).find(req.params.sessionId).then(function(session) {
    (new SessionStateResource(session)).update({
      allowNewCards: req.param('allowNewCards'),
      allowVoting: req.param('allowVoting')
    }).then(function(state) {
      events.publish('sessionState.changed', state);
    });
    res.send(202);
  }).catch(function() {
    res.send(404);
  });
});

router.get('/:sessionId/temperature', function(req, res) {
  (new SessionResource()).find(req.params.sessionId).then(function(session) {
    (new TemperatureResource(session)).load().then(function(temperature) {
      res.json(temperature.getValues());
    });
  }).catch(function() {
    res.send(404);
  });
});

router.post('/:sessionId/temperature/vote/:value', function(req, res) {
  (new SessionResource()).find(req.params.sessionId).then(function(session) {
    (new TemperatureResource(session)).increment(req.params.value).then(function(temperature) {
      temperature.load().then(function() {
        events.publish('temperature', temperature.getValues());
      });
      res.send(202);
    });
  }).catch(function() {
    res.send(404);
  });
});

module.exports = router;
