var $ = require('jquery');

var score = {

    me: 0,
    c1: 0,
    c2: 0,

    update: function() {
        $('#pscore').text(score.me);
        $('#c1score').text(score.c1);
        if (score.c2first) $('#c2score').text(score.c2);
    }

};

module.exports = score;