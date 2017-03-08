var $ = require('jquery')
var actionDrawer = require('./actionDrawer')
var timer = require('./timer')

var bb = {

  show: function(panel, opts) {
    var tmpl = require('../templates/button-bar')
    panel.html(tmpl(opts))
    bb.wireUp()
  },

  wireUp: function() {
    $('#pausebtn').on('click', function() {
      timer.isPaused = true
      timer.enableNoSleep()
      actionDrawer.open()
    })
  }

}

module.exports = bb
