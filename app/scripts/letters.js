const speech = require('./speech.js');
const timer = require('./timer.js');
const local = require('./local.js');
const score = require('./score.js');
const dictionary = require('./dictionary.js');
const $ = require('jquery');
const msg = require('./message');
const buttonBar = require('./buttonBar');
const declareTemplate = require('../templates/declare.jade');

let letters;
let wordLength;

const lettersRound = {

  load(val, switcheroo) {
    const rtn = {};

    rtn.letters = val.l;
    rtn.lettersClone = rtn.letters;
    rtn.oLetters = `${val.l}`;
    rtn.c1 = switcheroo ? val['2'] : val['1'];
    rtn.c1valid = switcheroo ? !val['2-bad'] : !val['1-bad'];

    if (rtn.c1.toUpperCase() !== rtn.c1) {
      rtn.c1valid = false;
      rtn.c1 = rtn.c1.substr(0, rtn.c1.length - 2).trim().toUpperCase();
    }

    rtn.othersC = val.c || [];
    rtn.othersD = val.d || [];
    rtn.others = rtn.othersC.concat(rtn.othersD);

    letters = rtn;
  },

  do(contestant) {
    $('.letter-grid').removeClass('letter-grid-small');
    if (letters.letters.length > 0) {
      const letter = letters.letters[0];
      letters.letters = letters.letters.substr(1);
      msg.show([{ msg: '', displayFor: 500 }], () => {
        $('.tile')[8 - letters.letters.length].innerText = letter;
        lettersRound.do(contestant);
      });
    } else {
      msg.show('Go!');
      timer.start(() => {
        msg.show("Time's up. How long?");
        $('.letter-declare').removeClass('hidden');
        $('body').on('keydown', (e) => {
          const k = e.keyCode;
          if (k >= 49 && k <= 57) {
            lettersRound.declareWordLength(k - 48);
          }
          e.preventDefault();
        });
        $('.letter-grid').addClass('hidden');
      });
    }
  },

  declare(word, playRound) {
    $('.word-declare').hide();

    msg.show([{ msg: declareTemplate({ p1: word, p2: letters.c1 }), displayFor: 800 }], () => {
      $('body').off('keydown');
      $('.tile')
      .removeClass('slot-hover')
      .off('click')
      .parent()
      .removeClass('slot-done');

      dictionary.isValidWord(word, wordLength, letters.oLetters, (isValid) => {
        const words = [word];
        const valids = [isValid];
        if (word !== letters.c1) {
          words.push(letters.c1);
          valids.push(letters.c1valid);
        }

        msg.show([{
          msg: declareTemplate({
            p1: word,
            p2: letters.c1,
            p1valid: isValid,
            p2valid: letters.c1valid,
            evaluated: true,
          }),
          displayFor: 1000 }], () => {
          const best = words.reduce((prev, cur, idx) => valids[idx] ? Math.max(prev, cur.length) : prev, 0);

          msg.show([{ msg: `We got: ${letters.others.slice(0, 2).join(', ')}`, displayFor: 1000 }], () => {
            if (isValid && word.length === best) score.me += word.length + (best === 9 ? 9 : 0);
            if (letters.c1valid && letters.c1.length === best) {
              score.c1 += letters.c1.length + (best === 9 ? 9 : 0);
            }

            playRound({
              letters: letters.lettersClone,
              what: [word, letters.c1],
              valid: [isValid, letters.c1valid],
            });
          });
        });
      });
    });
  },

  doTile() {
    const t = $(this).text();
    $(this).parent().addClass('slot-done');
    $(this).off('click');
    $('.word-declare').find('input[type=text]').val($('.word-declare').find('input[type=text]').val() + t).focus();
    $('#wordalt').val($('#word').val());
    if (!lettersRound.tiles) lettersRound.tiles = [$(this)];
    else lettersRound.tiles.push($(this));
  },

  declareWordLength(length) {
    wordLength = length;
    $('body').off('keydown').on('keydown', (e) => {
      let k = e.keyCode;
      if (k > 90) k -= 32;
      if (k >= 65 && k <= 90) {
        const elem = $(`.tile-wrapper:not(.slot-done) .tile:contains(${String.fromCharCode(k)}):first`);
        lettersRound.doTile.call(elem);
      } else if (e.keyCode === 8) {
        lettersRound.undo();
      } else if (e.keyCode === 13) {
        $('#goWord').click();
      }
      e.preventDefault();
    });
    $('.letter-declare').addClass('hidden');
    $('.letter-grid').removeClass('hidden').addClass('letter-grid-small');
    msg.show([
      { msg: declareTemplate({ declaring: true, p1: `You: ${length}`, p2: `${score.c1first}: ${letters.c1.length}` }), displayFor: 100 },
    ], () => {
      $('.word-declare')
        .show()
        .find('input[type=text]')
        .val('')
        .focus();
      buttonBar.show($('#buttons'), { round: 'letters', declare: true });
      $('.tile').on('click', lettersRound.doTile).addClass('slot-hover');
    });
  },

  undo() {
    if (lettersRound.tiles && lettersRound.tiles.length > 0) {
      const tile = lettersRound.tiles.pop();
      tile.parent().removeClass('slot-done');
      const newText = $('#word').val().substr(0, $('#word').val().length - 1);
      $('#word').val(newText).focus();
      $('#wordalt').val(newText);
      tile.on('click', function () {
        const t = $(this).text();
        $(this).parent().addClass('slot-done');
        $(this).off('click');
        $('.word-declare').find('input[type=text]').val($('.word-declare').find('input[type=text]').val() + t).focus();
        $('#wordalt').val($('#word').val());
        if (!lettersRound.tiles) lettersRound.tiles = [$(this)];
        else lettersRound.tiles.push($(this));
      });
    }
  },

};

module.exports = lettersRound;
