/* jshint node: true */
/* global document */
"use strict";

var $ = require('jquery'),
  game = require('./scripts/game');


var App = {
  init: function init() {
    $(document).ready(function() {
      game.init();
    });
  }
};

module.exports = App;