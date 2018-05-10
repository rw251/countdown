const $ = require('jquery');
const actionDrawer = require('./actionDrawer');
const timer = require('./timer');
const buttonBarTmpl = require('../templates/button-bar.jade');

const bb = {

  show(panel, opts) {
    panel.html(buttonBarTmpl(opts));
    bb.wireUp();
  },

  wireUp() {
    $('#pausebtn').on('click', () => {
      timer.pause();
      actionDrawer.open();
    });
  },

};

module.exports = bb;
