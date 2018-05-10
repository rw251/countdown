const speech = require('./speech.js');
const timer = require('./timer.js');
const score = require('./score.js');
const local = require('./local.js');
const $ = require('jquery');
const msg = require('./message');
const buttonBar = require('./buttonBar.js');
const declareTmpl = require('../templates/conundrumDeclare.jade');
const actionDrawer = require('./actionDrawer.js');

let conundrum;
let playRound;

const conundrumRound = {

  load(val, switcheroo, play) {
    playRound = play;
    const rtn = {
      c1: {},
      c2: {},
    };

    rtn.conundrum = val.l;
    if (rtn.conundrum.length === 10) {
      // occasioinally conundrum is abcdefghi* if they don't know what it actually was
      rtn.conundrum = rtn.conundrum.substr(0, 9).toUpperCase();
    }
    rtn.c1.answer = val['1'];
    rtn.c2.answer = val['2'];

    rtn.answer = val.s;

    rtn.c1.time = 60;
    rtn.c2.time = 60;

    if (val['1-time']) rtn.c1.time = +val['1-time'];
    if (val['2-time']) rtn.c2.time = +val['2-time'];
    // empty if nothing
    rtn.c1.success = false;
    rtn.c2.success = false;

    if (val['1-valid']) {
      // 1 got it
      rtn.who = 'c1';
      rtn.c1.success = true;
    }
    if (val['2-valid']) {
      // 1 got it
      rtn.who = 'c2';
      rtn.c2.success = true;
    }

    if (switcheroo) {
      rtn.c3 = rtn.c1;
      rtn.c1 = rtn.c2;
      rtn.c2 = rtn.c3;
    }

    console.log(rtn);

    conundrum = rtn;
  },

  do(contestant) {
    msg.show([
      { msg: 'Ok fingers on buzzers', displayFor: 1000 },
      { msg: "It's time to reveal todays's...", displayFor: 1000 },
      { msg: 'countdown..', displayFor: 1000 },
      { msg: 'conundrum.', displayFor: 1000 },
    ], () => {
      conundrum.conundrum.split('').forEach((l, i) => {
        $('.tile')[i].innerText = l;
      });
      if (conundrum.c1.time <= 30) {
        timer.conundrum(conundrum.c1.time, () => {
          msg.show([
            { msg: `BUZZ!! - Is it ${conundrum.c1.answer}`, displayFor: 2000 },
          ], () => {
            if (conundrum.c1.success) {
              conundrum.answer.split('').forEach((l, i) => {
                $($('.tile')[i]).text(l);
              });

              score.c1 += 10;
              score.update();
              msg.show([{ msg: `Well done ${contestant}`, displayFor: 1000 }], () => {
                actionDrawer.open();
                playRound({
                  time: [-1, conundrum.c1.time, conundrum.c2.time],
                }, true);
              });
            } else {
              msg.show([
                { msg: "No that's incorrect.", displayFor: 1000 },
                { msg: `${local.getName()}, the rest of the time is yours`, displayFor: 500 },
              ], () => {
                timer.conundrum(null, () => {
                  msg.show('So no one got it...');
                  conundrum.answer.split('').forEach((l, i) => {
                    $($('.tile')[i]).text(l);
                  });
                  msg.show([{ msg: 'Good game everyone.', displayFor: 1000 }], () => {
                    actionDrawer.open();
                    playRound({
                      time: [-1, -1, conundrum.c2.time],
                    }, true);
                  });
                });
              });
            }
          });
        });
      } else {
        timer.start(() => {
          msg.show('So no one got it...');
          conundrum.answer.split('').forEach((l, i) => {
            $($('.tile')[i]).text(l);
          });
          msg.show([{ msg: 'Good game everyone.', displayFor: 1000 }], () => {
            actionDrawer.open();
            playRound({
              time: [-1, -1, conundrum.c2.time],
            }, true);
          });
        });
      }
    });
  },

  declare(word) {
    $('body').off('keydown');
    $('.tile').removeClass('slot-hover').off('click').parent()
      .removeClass('slot-done');
    msg.show([
      { msg: `Is it ${word}`, displayFor: 500 },
      { msg: "Let's see...", displayFor: 1000 },
    ], () => {
      if (word.toLowerCase() === conundrum.answer.toLowerCase()) {
        conundrum.answer.split('').forEach((l, i) => {
          $($('.tile')[i]).text(l);
        });
        score.me += 10;
        score.update();
        msg.show([{ msg: `${conundrum.answer}. Well done. Good game everyone`, displayFor: 1000 }], () => {
          actionDrawer.open();
          playRound({
            time: [timer.getTime(), conundrum.c1.time, conundrum.c2.time],
          }, true);
        });
      } else {
        'INCORRECT'.split('').forEach((l, i) => {
          $($('.tile')[i]).text(l);
        });
        speech.say(`No that's wrong. Rest of the time for you, ${score.c1first}`, 'nick', () => {
          conundrum.conundrum.split('').forEach((l, i) => {
            $($('.tile')[i]).text(l);
          });
          if (conundrum.c1.time <= 30) {
            timer.conundrum(conundrum.c1.time, () => {
              speech.say(`${score.c1first}?`, 'nick', () => {
                speech.say(`BUZZ!! Is it ${conundrum.c1.answer || conundrum.answer}`, score.c1first, () => {
                  speech.say("Let's see...", 'nick', () => {
                    if (conundrum.c1.success) {
                      conundrum.answer.split('').forEach((l, i) => {
                        $($('.tile')[i]).text(l);
                      });
                      score.c1 += 10;
                      score.update();
                      msg.show([{ msg: `Well done ${score.c1first}`, displayFor: 1000 }], () => {
                        actionDrawer.open();
                        playRound({
                          time: [-1, conundrum.c1.time, conundrum.c2.time],
                        }, true);
                      });
                    } else {
                      'INCORRECT'.split('').forEach((l, i) => {
                        $($('.tile')[i]).text(l);
                      });
                      speech.say('So no one got it...', 'nick', () => {
                        conundrum.answer.split('').forEach((l, i) => {
                          $($('.tile')[i]).text(l);
                        });
                        msg.show([{ msg: `${conundrum.answer}. Good game everyone`, displayFor: 1000 }], () => {
                          actionDrawer.open();
                          playRound({
                            time: [-1, -1, conundrum.c2.time],
                          }, true);
                        });
                      });
                    }
                  });
                });
              });
            });
          }
        });
      }
    });
  },

  buzz() {
    timer.stop();

    $('.tile').on('click', conundrumRound.doTile).addClass('slot-hover');

    msg.show(declareTmpl({}));
    buttonBar.show($('#buttons'), { round: 'conundrum', declare: true });

    $('body').on('keydown', (e) => {
      let k = e.keyCode;
      if (k > 90) k -= 32;
      if (k >= 65 && k <= 90) {
        conundrumRound.doTile.call($(`.tile3:not(.slot-done) .tile:contains(${String.fromCharCode(k)}):first`));
        e.preventDefault();
      } else if (e.keyCode === 8) {
        conundrumRound.undo();
        e.preventDefault();
      } else if (e.keyCode === 13) {
        $('#goConundrum').click();
        e.preventDefault();
      }
      // e.preventDefault();
    });
  },

  doTile() {
    const t = $(this).text();
    $(this).parent().addClass('slot-done');
    $(this).off('click');
    $('.conundrum-declare').find('input[type=text]').val($('.conundrum-declare').find('input[type=text]').val() + t).focus();
    $('#conundrumalt').val($('#conundrum').val());
    if (!conundrumRound.tiles) conundrumRound.tiles = [$(this)];
    else conundrumRound.tiles.push($(this));
  },

  undo() {
    if (conundrumRound.tiles && conundrumRound.tiles.length > 0) {
      const tile = conundrumRound.tiles.pop();
      tile.parent().removeClass('slot-done');
      const newText = $('#conundrum').val().substr(0, $('#conundrum').val().length - 1);
      $('#conundrum').val(newText).focus();
      $('#conundrumalt').val(newText);
      tile.on('click', function onTileClick() {
        const t = $(this).text();
        $(this).parent().addClass('slot-done');
        $(this).off('click');
        $('.conundrum-declare').find('input[type=text]').val($('.conundrum-declare').find('input[type=text]').val() + t).focus();
        $('#conundrumalt').val($('#conundrum').val());
        if (!conundrumRound.tiles) conundrumRound.tiles = [$(this)];
        else conundrumRound.tiles.push($(this));
      });
    }
  },

};

module.exports = conundrumRound;
