const speech = require('./speech.js');
const timer = require('./timer.js');
const score = require('./score.js');
const local = require('./local.js');
const msg = require('./message');
const $ = require('jquery');

let numbers;

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
    rtn.c1 = +val['1'] || 0;
    rtn.c2 = +val['2'] || 0;
    if (val['1-sol'] === 'X') {
      rtn.c1valid = false;
    } else {
      rtn.c1method = val['1-sol'];
    }
    if (val['2-sol'] === 'X') {
      rtn.c2valid = false;
    } else {
      rtn.c2method = val['2-sol'];
    }

    rtn.rachel = val.sol;

    if (switcheroo) {
      rtn.c3 = rtn.c1;
      rtn.c1 = rtn.c2;
      rtn.c2 = rtn.c3;
      rtn.c3valid = rtn.c1valid;
      rtn.c1valid = rtn.c2valid;
      rtn.c2valid = rtn.c3valid;
      rtn.c3method = rtn.c1method;
      rtn.c1method = rtn.c2method;
      rtn.c2method = rtn.c3method;
    }

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

    const points = numbers.target - number === 0 ? 10 : 7;
    const c1points = numbers.target - numbers.c1 === 0 ? 10 : 7;
    const c2points = numbers.target - numbers.c2 === 0 ? 10 : 7;

    const diff = {
      p: Math.abs(numbers.target - number),
      c1: numbers.c1method ? Math.abs(numbers.target - numbers.c1) : 100,
      c2: numbers.c2method ? Math.abs(numbers.target - numbers.c2) : 100,
    };

    let texts = [];
    texts.push({
      what: number === 0 ? 'Sorry, I messed up.' : number,
      who: local.getName(),
    });
    texts.push({
      what: numbers.c1method ? numbers.c1 : 'Sorry, I messed up',
      who: score.c1first,
    });

    msg.show([{ msg: `${score.c1first}: ${numbers.c1method ? numbers.c1 : 'Sorry, I messed up'}`, displayFor: 1000 }], () => {
      let mindiff = score.c2first ? Math.min(diff.c1, diff.c2) : diff.c1;
      let method;
      const winners = [];

      if (mindiff < diff.p || number === 0) {
        // you lost - so don't bother
        if (mindiff === diff.c1 && numbers.c1method) {
          winners.push(score.c1first);
          method = numbers.c1method;
          score.c1 += c1points;
        }
        if (score.c2first && mindiff === diff.c2 && numbers.c2method) {
          score.c2 += c2points;
          method = numbers.c2method;
          winners.push(score.c2first);
        }
        if (winners.length === 0) {
          msg.show([
            { msg: 'No one got it.. Rachel?', displayFor: 1000 },
            { msg: numbers.rachel, displayFor: 3000 },
          ], () => {
            playRound({
              numbers: numbers.selectionClone,
              target: numbers.target,
              what: [number, numbers.c1, numbers.c2],
              valid: [null, !!numbers.c1method, !!numbers.c2method],
            });
          });
        } else if (winners.length === 1) {
          msg.show([
            { msg: `Go on ${winners[0]}`, displayFor: 1000 },
            { msg: method, displayFor: 3000 },
          ], () => {
            speech.say(`Well done ${winners[0]}`, 'rachel', () => {
              playRound({
                numbers: numbers.selectionClone,
                target: numbers.target,
                what: [number, numbers.c1, numbers.c2],
                valid: [null, !!numbers.c1method, !!numbers.c2method],
              });
            });
          });
        } else if (winners.length === 2 && score.c2first) {
          speech.say(`Well done ${winners.join(' and ')}`, 'nick', () => {
            playRound({
              numbers: numbers.selectionClone,
              target: numbers.target,
              what: [number, numbers.c1, numbers.c2],
              valid: [null, !!numbers.c1method, !!numbers.c2method],
            });
          });
        }
        return;
      }

      numberRound.checkNumber(number, (isValid) => {
        if (isValid) mindiff = Math.min(mindiff, diff.p);
        if (mindiff === diff.c1 && numbers.c1method) {
          winners.push(score.c1first);
          score.c1 += c1points;
        }
        if (score.c2first && mindiff === diff.c2 && numbers.c2method) {
          score.c2 += c2points;
          winners.push(score.c2first);
        }
        texts = [];
        if (!isValid && number > 0) {
          texts.push({
            what: "Sorry, ' + local.getName() + ', but you've gone wrong.",
            who: 'rachel',
          });
        } else if (mindiff === diff.p) {
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
              what: [number, numbers.c1, numbers.c2],
              valid: [isValid, !!numbers.c1method, !!numbers.c2method],
            });
          });
        } else if (winners.length === 1) {
          speech.say(`Well done ${winners[0]}`, 'nick', () => {
            playRound({
              numbers: numbers.selectionClone,
              target: numbers.target,
              what: [number, numbers.c1, numbers.c2],
              valid: [isValid, !!numbers.c1method, !!numbers.c2method],
            });
          });
        } else if (winners.length === 2 && score.c2first) {
          speech.say(`Well done ${winners.join(' and ')}`, 'nick', () => {
            playRound({
              numbers: numbers.selectionClone,
              target: numbers.target,
              what: [number, numbers.c1, numbers.c2],
              valid: [isValid, !!numbers.c1method, !!numbers.c2method],
            });
          });
        } else {
          speech.say('Well done everyone.', 'nick', () => {
            playRound({
              numbers: numbers.selectionClone,
              target: numbers.target,
              what: [number, numbers.c1, numbers.c2],
              valid: [isValid, !!numbers.c1method, !!numbers.c2method],
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
