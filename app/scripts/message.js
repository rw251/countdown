const $ = require('jquery');
const messageTmpl = require('../templates/message.jade');

const writeMessage = function writeMessage(message) {
  const html = messageTmpl({ msg: message });

  $('#message').html(html);
};

const writeMessageArray = function writeMessageArray(messages, callback) {
  if (messages.length === 0) {
    callback();
  } else {
    const item = messages.shift();
    writeMessage(item.msg);
    setTimeout(() => {
      writeMessageArray(messages, callback);
    }, item.displayFor);
  }
};

const msg = {

  // Either a string or an array of {message: "xxx", displayFor: n}
  show(message, callback) {
    if (typeof message === 'string') {
      writeMessage(message);
      if (typeof callback === 'function') {
        callback();
      }
    } else {
      writeMessageArray(message, callback);
    }
  },

  hide() {

  },

};

module.exports = msg;
