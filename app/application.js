/*
TODO

BUGS
susie - "we got" then blank when theirs is same as ours
4084 - conundrum freezes
4887 - declares TAGGER - mine accepted contestant not
if lose network games freezes at word check

FEATURES
- clock to dial
- button to skip to end of clock
- list of games/contestants
- hit play show animation?
- button to say "ready for conundrum"
5115 - conundrum example of "No - sorry not got it"
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
