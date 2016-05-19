var time = 30;

var countdown = function(finalCallback) {
    $('.clock').text(time);
    if (time === 0) {
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

    start: function(callback) {
        countdown(callback);
    },

    reset: function() {
        time=timer.LENGTH;
        $('.clock').text(timer.LENGTH);
    }

};

module.exports = timer;