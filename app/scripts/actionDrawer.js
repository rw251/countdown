var  $ = require('jquery')

var ad = {

  close: function(){
    $('.action-drawer').hide()
  },

  open: function(){
    $('.action-drawer').show()
  }
}

module.exports = ad
