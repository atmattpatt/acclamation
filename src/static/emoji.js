'use strict';

var options = [
  {
    match: /\B:([\-+\w]*)$/,
    search: function (term, callback) {
      callback($.map(base_emojis, function (emoji) { // jshint ignore:line
        return emoji.indexOf(term) === 0 ? emoji : null;
      }));
    },
    template: function (value) {
      return '<img src="/images/emoji/' + value + '.png" class="emoji"></img>' + value;
    },
    replace: function (value) {
      return ':' + value + ': ';
    },
    index: 1
  }
];

$(function() {
  $('.emoji-autocomplete').textcomplete(options);
});

module.exports = options;
