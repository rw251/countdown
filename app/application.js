/*
TODO

BUGS
4887 - declares TAGGER - mine accepted contestant not
4955 allows me pouncer but disallows oppo
3880 declare 7 and lectures in round 2. OPP doesn't get points

FEATURES
- don't allow me to buzz immediately after contestant has buzzed
- clock to dial
- button to skip to end of clock
- list of games/contestants
- hit play show animation?
- button to say "ready for conundrum"
5115 - conundrum example of "No - sorry not got it"
3795 example of word shorter Ryan declaration and a declaration of length without a word.

Display game number for debug purposes.
Game 's Malcolm fairy. Stops after repaves greaves. Not issue but sometimes get 502 from oed.
Don't query oed if word in list of contestants or dic corner

Chris colsam. First game KB...  Conundrum messed up because rather than NINEUPPER it is ninelower*

2965 loads as 4550

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
