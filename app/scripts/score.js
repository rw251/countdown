const $ = require('jquery');

const score = {

  me: 0,
  c1: 0,
  me2: 0, // if playing other player
  c2: 0, // other player

  update() {
    $('#p1score').text(score.me);
    $('#c1score').text(score.c1);
  },

};

module.exports = score;
