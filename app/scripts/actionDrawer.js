const $ = require('jquery');

const ad = {

  close() {
    $('.action-drawer').hide();
  },

  open() {
    $('.action-drawer').show();
  },
};

module.exports = ad;
