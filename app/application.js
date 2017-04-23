/*
TODO

BUGS
4778 - More than 10 away on numbers scored points
susie - "we got" then blank when theirs is same as ours
4752 - vtt.. - i've got a 1 "-"

FEATURES
- clock to dial
- button to skip to end of clock
- list of games/contestants
- hit play show animation?
- button to say "ready for conundrum"
5115 - conundrum example of "No - sorry not got it"
check if only 5 points if 7-10 away
3795 example of word shorter Ryan declaration and a declaration of length without a word.

*/

const $ = require('jquery');
const game = require('./scripts/game');

const App = {
  init: function init() {
    $(document).ready(() => {
      game.init();
    });
  },
};

module.exports = App;
