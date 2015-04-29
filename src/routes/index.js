'use strict';

var express = require('express');
var router = express.Router();
var SessionResource = require('../models/sessionResource');

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

module.exports = router;
