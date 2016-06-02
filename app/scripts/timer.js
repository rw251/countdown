var time = 30,
    $ = require('jquery'),
    n = require('nosleep.js'),
    noSleep = new n();

var countdown = function(finalCallback) {
    $('.clock').text(time);
    if (time === 0) {
        noSleep.disable();
        finalCallback();
    }
    else {
        time--;
        setTimeout(function() {
            countdown(finalCallback);
        }, 1000);
    }
};

var timer = {

    LENGTH: 30,

    enableNoSleep: function() {
        noSleep.enable();
    },

    start: function(callback) {
        countdown(callback);
    },

    reset: function() {
        time = timer.LENGTH;
        $('.clock').text(timer.LENGTH);
    }

};

module.exports = timer;