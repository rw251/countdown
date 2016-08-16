var time = 30,
    $ = require('jquery'),
    n = require('nosleep.js'),
    noSleep = new n();

var countdown = function(finalCallback, buzz) {
    if(timer.isPaused){
        timer.isPaused = false;
        return;
    }
    if(time-Math.floor(time)===0) $('.clock').text(time);
    if (time === 0) {
        noSleep.disable();
        finalCallback();
    } else if (buzz && timer.LENGTH-time === buzz) {
        noSleep.disable();
        finalCallback();
    } else {
        time-=0.25;
        setTimeout(function() {
            countdown(finalCallback, buzz);
        }, 250);
    }
};

var timer = {

    LENGTH: 30,
    
    isPaused: false,

    enableNoSleep: function() {
        noSleep.enable();
    },

    start: function(callback) {
        timer.isPaused=false;
        countdown(callback);
    },

    reset: function() {
        time = timer.LENGTH;
        $('.clock').text(timer.LENGTH);
    },

    conundrum: function(buzztime, callback) {
        countdown(callback, buzztime);
    }

};

module.exports = timer;