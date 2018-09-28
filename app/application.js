/*
SCORE TESTS

LETTERS

WN	LSE	ME
7	  7	  8	  DONE
7	  7	  7	  DONE
7	  7	  6	  DONE
7	  6	  8	  DONE
7	  6	  7	  DONE
7	  6	  6	  DONE
6	  7	  8	  DONE
6	  7	  7	  DONE
6	  7	  6	  DONE
7	  x	  8	  DONE
7	  x	  7	  DONE
7	  x	  6	  DONE
x	  7	  8	  DONE
x	  7	  7	  DONE
x	  7	  6	  DONE
7	  7	  x	  DONE
7	  6	  x	  DONE
6	  7	  x	  DONE
7	  x	  x	  DONE
x	  7	  x	  DONE
x	  x	  7	  DONE
x	  x	  x	  DONE

NUMBERS

Y	y	Y	DONE
Y	y	y	DONE
Y	y	n	DONE
Y	Y	Y	DONE
Y	Y	y	DONE
Y	Y	n
Y	n	Y	DONE
Y	n	y	ERROR
Y	n	n
y	y	Y	DONE
y	y	y	DONE
y	y	n
y	Y	Y
y	Y	y
y	Y	n
y	n	Y
y	n	y
y	n	n
n	y	Y
n	y	y
n	y	n
n	Y	Y
n	Y	y
n	Y	n
n	n	Y
n	n	y
n	n	n

CONUNDRUM

Y	-	-	DONE
Y	X	-
Y	-	X
X	X	Y
X	X	-
X	X	X
X	-	Y
X	-	-
X	-	X
X	Y	X
X	Y	-
-	X	Y
-	X	-
-	X	X
-	-	Y
-	-	-
-	-	X
-	Y	X
-	Y	-

BUGS
4887 - declares TAGGER - mine accepted contestant not
4955 allows me pouncer but disallows oppo
3880 declare 7 and lectures in round 2. OPP doesn't get points
Chris colsam. First game KB...  Conundrum messed up because rather than NINEUPPER it is ninelower*
2965 loads as 4550
2086 Stops after repaves greaves. Not issue but sometimes get 502 from oed.
Sometimes countdown doesn't start on conundrum (especially,
    maybe only, when i've buzzed early on previous rounds)
4314 - disallows CANAPE
4356 - round two example of Not Written Down - currently gives them 7 points -  or maybe not might have got it wrong

3639 - second numbers if declare 501 (e.g. would lose to champ but beat challenger - should get points against challenger)

FEATURES
- don't allow me to buzz immediately after contestant has buzzed
- clock to dial
- list of games/contestants
- hit play show animation?
- button to say "ready for conundrum"

EXAMPLE GAMES
5115: conundrum example of "No - sorry not got it"
3795: example of word shorter Ryan declaration and a declaration of length without a word.

Display game number for debug purposes.

Don't query oed if word in list of contestants or dic corner


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
