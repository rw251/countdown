const speech = require('./speech.js');
const timer = require('./timer.js');
const score = require('./score.js');
const local = require('./local.js');
const msg = require('./message');
const $ = require('jquery');

let numbers;

const getPoints = (declare, target) => {
  if (declare === target) return 10;
  if (Math.abs(declare - target) <= 5) return 7;
  if (Math.abs(declare - target) <= 10) return 5;
  return 0;
};

const numberRound = {

  load(val, switcheroo) {
    const rtn = {};

    rtn.selection = val.n;
    rtn.selectionClone = val.n.slice();

    rtn.small = 0;
    rtn.large = 0;

    rtn.selection.forEach((n) => {
      if (n > 10) rtn.large += 1;
      else rtn.small += 1;
    });

    rtn.say = rtn.large === 0 ? '6 small numbers' : `${rtn.large} large number${rtn.large === 1 ? '' : 's'} and ${rtn.small} small ones`;

    rtn.target = val.t;
    rtn.c1 = switcheroo ? (+val['2'] || 0) : (+val['1'] || 0);
    if (switcheroo) {
      if (val['2-sol'] === 'X') {
        rtn.c1valid = false;
      } else {
        rtn.c1method = val['2-sol'];
      }
    } else if (val['1-sol'] === 'X') {
      rtn.c1valid = false;
    } else {
      rtn.c1method = val['1-sol'];
    }

    rtn.rachel = val.sol;

    numbers = rtn;
  },

  getTarget() {
    return numbers.target;
  },

  do(contestant) {
    let number;
    if (numbers.selection.length === 6) {
      number = numbers.selection.pop();
      speech.say(`Hi Rachel, can I have ${numbers.say} please.`, contestant, () => {
        $($('.tile')[5]).removeClass('digits2 digits3 digits4');
        if (number > 9) $($('.tile')[5]).addClass('digits2');
        if (number > 99) $($('.tile')[5]).addClass('digits3');
        $('.tile')[5].innerText = number;
        speech.say(number, 'Rachel', () => {
          numberRound.do(contestant);
        });
      });
    } else if (numbers.selection.length > 0) {
      number = numbers.selection.pop();
      $($('.tile')[numbers.selection.length]).removeClass('digits2 digits3 digits4');
      if (number > 9) $($('.tile')[numbers.selection.length]).addClass('digits2');
      if (number > 99) $($('.tile')[numbers.selection.length]).addClass('digits3');
      $('.tile')[numbers.selection.length].innerText = number;
      speech.say(number, 'Rachel', () => {
        numberRound.do(contestant);
      });
    } else {
      msg.show([
        { msg: 'And the target is...', displayFor: 1000 },
        { msg: numbers.target, displayFor: 1000 },
        { msg: 'GO!', displayFor: 500 },
      ], () => {
        $('.target-number').text(numbers.target);
        $('#ivegot').show();
        timer.start(() => {
          speech.say("Time's up. So what do you have?", 'nick');
          $('.number-declare').show().find('input[type=text]').val('')
            .focus();
        });
      });
    }
  },

  declare(numberString, playRound) {
    $('.number-declare').hide();

    const number = +numberString;

    const points = getPoints(number, numbers.target);
    const c1points = getPoints(numbers.c1, numbers.target);

    const diff = {
      p: Math.abs(numbers.target - number),
      c1: numbers.c1method ? Math.abs(numbers.target - numbers.c1) : 100,
    };

    msg.show([{ msg: `${score.c1first}: ${numbers.c1method ? numbers.c1 : 'Sorry, I messed up'}`, displayFor: 1000 }], () => {
      let method;
      const winners = [];

      if (diff.c1 < diff.p || number === 0) {
        // you lost - so don't bother
        if (numbers.c1method) {
          winners.push(score.c1first);
          method = numbers.c1method;
          score.c1 += c1points;
          msg.show([
            { msg: `Go on ${winners[0]}`, displayFor: 1000 },
            { msg: method, displayFor: 3000 },
          ], () => {
            speech.say(`Well done ${winners[0]}`, 'rachel', () => {
              playRound({
                numbers: numbers.selectionClone,
                target: numbers.target,
                what: [number, numbers.c1],
                valid: [null, !!numbers.c1method],
              });
            });
          });
        } else {
          msg.show([
            { msg: 'No one got it.. Rachel?', displayFor: 1000 },
            { msg: numbers.rachel, displayFor: 3000 },
          ], () => {
            playRound({
              numbers: numbers.selectionClone,
              target: numbers.target,
              what: [number, numbers.c1],
              valid: [null, !!numbers.c1method],
            });
          });
        }
        return;
      }

      numberRound.checkNumber(number, (isValid) => {
        let mindiff = diff.c1;
        if (isValid) mindiff = Math.min(diff.c1, diff.p);
        if (mindiff === diff.c1 && numbers.c1method) {
          winners.push(score.c1first);
          score.c1 += c1points;
        }
        if (mindiff === diff.p) {
          score.me += points;
          winners.push(local.getName());
        }

        if (winners.length === 0) {
          msg.show([
            { msg: 'No one got it.. Rachel?', displayFor: 1000 },
            { msg: numbers.rachel, displayFor: 3000 },
          ], () => {
            playRound({
              numbers: numbers.selectionClone,
              target: numbers.target,
              what: [number, numbers.c1],
              valid: [isValid, !!numbers.c1method],
            });
          });
        } else if (winners.length === 1) {
          speech.say(`Well done ${winners[0]}`, 'nick', () => {
            playRound({
              numbers: numbers.selectionClone,
              target: numbers.target,
              what: [number, numbers.c1],
              valid: [isValid, !!numbers.c1method],
            });
          });
        } else {
          speech.say('Well done everyone.', 'nick', () => {
            playRound({
              numbers: numbers.selectionClone,
              target: numbers.target,
              what: [number, numbers.c1],
              valid: [isValid, !!numbers.c1method],
            });
          });
        }
      });
    });
  },

  checkNumber(number, callback) {
    if (number === 0) {
      callback(false);
    } else {
      $('#messedUp').on('click', () => {
        $('.tile').removeClass('slot-hover').off('click').removeClass('slot-hide slot-selected');
        $('.calcslot').removeClass('slot-hover').off('click').removeClass('slot-hide slot-selected');
        $('.number-calc').hide();
        $('#messedUp').off('click');
        callback(false);
      });

      $('.number-calc').show();
      $('#ivegot').hide();
      $('#buttons').hide();

      let n1;
      let n2;
      let nn1;
      let nn2;
      let symbol;
      let sum;

      const symclick = function symclick() {
        if (!n1) return;
        symbol = $(this);
        $(this).addClass('slot-selected');
        $('.calcslot').off('click');
      };

      const numclick = function numclick() {
        if (symbol) {
          n2 = $(this);
          $(this).off('click');
          nn1 = +n1.text();
          nn2 = +n2.text();

          if (symbol.data('operator') === 'add') {
            sum = nn1 + nn2;
          } else if (symbol.data('operator') === 'times') {
            sum = nn1 * nn2;
          } else if (symbol.data('operator') === 'divide') {
            sum = nn1 / nn2;
          } else {
            sum = nn1 - nn2;
          }
          n1.removeClass('digits2 digits3 digits4');
          if (sum > 9) n1.addClass('digits2');
          if (sum > 99) n1.addClass('digits3');
          if (sum > 999) n1.addClass('digits4');
          n1.text(sum);

          n1.removeClass('slot-selected').addClass('slot-hover').on('click', numclick);
          n2.removeClass('slot-selected').addClass('slot-hide');
          $('.calcslot').removeClass('slot-selected').on('click', symclick).addClass('slot-hover');

          if (+n1.text() === number) {
            $('.tile').removeClass('slot-hover').off('click').removeClass('slot-hide slot-selected');
            $('.calcslot').removeClass('slot-hover').off('click').removeClass('slot-hide slot-selected');
            $('.number-calc').hide();
            $('#messedUp').off('click');
            callback(true);
          }

          n1 = null;
          n2 = null;
          symbol = null;
        } else if (!n1) {
          n1 = $(this);
          $(this).addClass('slot-selected');
          $(this).off('click');
        }
      };

      $('.tile').on('click', numclick).addClass('slot-hover');
      $('.calcslot').on('click', symclick).addClass('slot-hover');
    }
  },

};

module.exports = numberRound;
