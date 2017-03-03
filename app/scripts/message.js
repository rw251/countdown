var $ = require('jquery')

var msg = {

  show: function(message) {
    var tmpl = require('../templates/message')
    var html = tmpl({msg:message})

    $('#message').html(html);
  }

}

module.exports = msg
