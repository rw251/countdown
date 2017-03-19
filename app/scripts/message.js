var $ = require('jquery')

var writeMessage = function(message) {
  var tmpl = require('../templates/message')
  var html = tmpl({msg:message})

  $('#message').html(html)
}

var hideMessage = function() {
  $('#message').html("")
}

var writeMessageArray = function(messages, callback) {
  if(messages.length===0) return callback();

  var item = messages.shift();
  writeMessage(item.msg)
  setTimeout(function(){
    writeMessageArray(messages, callback)
  }, item.displayFor)
}

var msg = {

  // Either a string or an array of {message: "xxx", displayFor: n}
  show: function(message, callback) {
    if(typeof message === "string") {
      writeMessage(message)
      if(typeof callback === "function") {
        return callback();
      }
    } else {
      writeMessageArray(message, callback)
    }
  },

  hide: function() {

  }

}

module.exports = msg
