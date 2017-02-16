'use strict'

var $ = require('jquery')
var game = require('./scripts/game')

var App = {
  init: function init () {
    $(document).ready(function () {
      game.init()
    })
  }
}

module.exports = App
