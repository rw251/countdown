const speech = require('./speech');
const numberRound = require('./numbers');
const letterRound = require('./letters');
const conundrumRound = require('./conundrum');
const timer = require('./timer');
const score = require('./score');
const local = require('./local');
const $ = require('jquery');
const localforage = require('localforage');
const dictionary = require('./dictionary');
const actionDrawer = require('./actionDrawer');
const buttonBar = require('./buttonBar');
const lettersTmpl = require('../templates/letters.jade');
const numbersTmpl = require('../templates/numbers.jade');
const conundrumTmpl = require('../templates/conundrum.jade');
const scoreTmpl = require('../templates/score.jade');
const welcomeTmpl = require('../templates/welcome.jade');
const actionDrawerTmpl = require('../templates/action-drawer.jade');

let currentEpisode;
let c1;
let c2;
let rows;
let name;
let round = -1;
let switcheroo = false;
let skipLetters = true;
let skipNumbers = false;
let skipConundrums = false;
const gameRecord = [];

const playRound = function playRound(lastRound, save) {
  if (lastRound) gameRecord.push(lastRound);

  if (save) {
    localforage.getItem('gamelist', (getErr, vals) => {
      if (getErr) console.log(getErr);
      const val = vals || [];
      val.push(currentEpisode);
      localforage.setItem('gamelist', val);
      localforage.setItem(`${currentEpisode}`, gameRecord, (setErr) => {
        if (setErr) console.log(setErr);
      });
    });

    return;
  }

  let cont;

  timer.reset();
  // $('.page').hide();
  // $('#clock-score').show();
  // $('.letter-board .tileInner').html("");
  // $('.number-board .tileInner').html("");
  // $('.nslot').html("&nbsp;");
  round += 1;
  score.update();

  // $('#test').html(rows[round]);
  $('#buttons').show();

  if (Object.prototype.hasOwnProperty.call(rows[round], 's') && !skipConundrums) {
    // con
    conundrumRound.load(rows[round], switcheroo, playRound);
    buttonBar.show($('#buttons'), { round: 'conundrum', declare: false });
    $('#container').html(conundrumTmpl());

    speech.say("So finally it's time for the conundrum.  Fingers on buzzers as we reveal, today's, countdown conundrum.", 'nick', () => {
      conundrumRound.do(score.c1first);
    });
  } else if (Object.prototype.hasOwnProperty.call(rows[round], 'l') && !skipLetters) {
    // letters
    $('#container').html(lettersTmpl());
    buttonBar.show($('#buttons'), { round: 'letters', placing: true });
    letterRound.load(rows[round], switcheroo);
    cont = ([1, 2, 5, 6, 8, 9, 12, 13, 14, 15].indexOf(round) % 2 === 0 ? score.c1first : name);

    speech.say(`Ok, ${cont}${speech.LETTERS}`, 'NICK', () => {
      letterRound.do(cont);
    });
  } else if (Object.prototype.hasOwnProperty.call(rows[round], 'n') && !skipNumbers) {
    // numbers
    cont = ([3, 7, 10, 16].indexOf(round) % 2 === 0 ? score.c1first : name);
    buttonBar.show($('#buttons'), { round: 'numbers', declare: false });
    numberRound.load(rows[round], switcheroo);

    $('#container').html(numbersTmpl({target: +numberRound.getTarget(),}));

    speech.say(`Ok, ${cont}${speech.NUMBERS}`, 'NICK', () => {
      numberRound.do(cont);
    });
  } else {
    // Tea time teaser
    playRound();
  }
};

const startGame = function startGame(episode, vs, player) {
  rows = episode.r;
  name = player;
  c1 = episode.p1.n;
  c2 = episode.p2.n;
  const isChampWinner = episode.p1.s > episode.p2.s;

  if (vs === 'cham') {
    // all fine
  } else if (vs === 'chal') {
    c1 = c2;
  } else if (vs === 'winn') {
    c1 = isChampWinner ? c1 : c2;
  } else if (vs === 'lose') {
    c1 = isChampWinner ? c2 : c1;
  } else if (vs === 'rand') {
    c1 = Math.random() > 0.5 ? c1 : c2;
  }
  if (c1 === c2) switcheroo = true;

  score.c1first = c1.split(' ')[0];

  $('#p1').text(`${name}: `);
  $('#c1').text(`${score.c1first}: `);

  speech.say([{
    what: speech.WELCOME,
    who: 'nick',
  }, {
    what: `${speech.WHO + player} and ${c1}.`,
    who: 'nick',
  }], () => {
    playRound();
  });
};

const cacheEpisode = function cacheEpisode(episode, callback) {
  localforage.getItem('cachedEpisodes', (getErr, vals) => {
    if (getErr) return callback(getErr);
    const val = vals || [];
    val.push(episode);
    return localforage.setItem('cachedEpisodes', val, (setErr) => {
      if (setErr) return callback(setErr);
      return callback();
    });
  });
};

const getEpisode = function getEpisode(episodeNumber, callback) {
  $
    .get(`episode.php?e=${episodeNumber}`)
    .success((doc) => {
      callback(null, JSON.parse(doc));
    }).error((jqXHR, textStatus, err) => callback(new Error(err)));
};

const getRandomEpisode = function (callback) {
  localforage.getItem('gamelist', (getErr, vals) => {
    if (getErr) throw getErr;
    const val = vals || [];
    let r = Math.floor(Math.random() * 5000) + 1000;

    while (val.indexOf(r) > -1) {
      r = Math.floor(Math.random() * 5000) + 1000;
    }

    getEpisode(r, (err, epVal) => {
      if (err) return callback(err);
      return callback(null, epVal);
    });
  });
};

const numberOfCachedGames = function (callback) {
  localforage.getItem('cachedEpisodes', (err, vals) => {
    if (err) return callback(err);
    const val = vals || [];
    console.log(`${val.length} cached episodes.`);
    return callback ? callback(null, val.length) : val;
  });
};

const refillCachedGames = function (limit, callback) {
  numberOfCachedGames((numErr, num) => {
    if (numErr) return callback(numErr);
    if (num < limit) {
      return getRandomEpisode((err, val) => {
        if (err) return callback(err);
        if (!val.e) {
          return refillCachedGames(limit, callback);
        }
        return cacheEpisode(val, () => {
          refillCachedGames(limit, callback);
        });
      });
    }
    return callback();
  });
};

const resetCache = function () {
  localforage.getItem('cachedEpisodes', (getErr) => {
    if (getErr) console.log(getErr);
    console.log('Resetting cache...');
    localforage.setItem('cachedEpisodes', [], (err) => {
      if (err) console.log(err);
      console.log('Cache reset.');
      refillCachedGames(10, () => {});
    });
  });
};

const getEpisodeFromCache = function (callback) {
  localforage.getItem('cachedEpisodes', (err, val) => {
    if (err) return callback(err);
    const episode = val.pop();
    return localforage.setItem('cachedEpisodes', val, (setErr) => {
      if (setErr) return callback(setErr);
      return callback(null, episode);
    });
  });
};

const initialise = function () {
  numberOfCachedGames();
  refillCachedGames(10, () => {});

  $('#container').html(welcomeTmpl(local.settings));
  score.me = 0;
  score.c1 = 0;
  score.c2 = 0;

  $('#episode').keydown((e) => {
    if (e.keyCode === 13) $('#go').click();
  });

  $('#go').on('click', (e) => {
    $('#go').text('Loading...').prop('disabled', true);

    timer.enableNoSleep();
    const vs = $('select[name=player]').val();
    let episodeNumber = $('#episode').val();
    episodeNumber = episodeNumber === '' ? Math.floor(Math.random() * 5000) + 1000 : episodeNumber;

    speech.silent = !$('#setting-speech').is(':checked');
    speech.speed = +$('[name=setting-speed]:checked').val();
    timer.LENGTH = +$('#setting-clock').val();
    timer.reset();
    skipLetters = !$('#setting-inc-letters').is(':checked');
    skipNumbers = !$('#setting-inc-numbers').is(':checked');
    skipConundrums = !$('#setting-inc-conundrum').is(':checked');
    $('#container').parent().fadeOut('slow');

    /*
     LLNLLNLLNLLLLNC - 5666 -
     LLLLNLLLLNLLLNC - 3086 - 5665
     LLLNLLLNC       - 1    - 3086
     LLNLLNCLLNLLNC  - 14 round (grand finals / CoCs / 2 specials)
        [80,132,184,234,288,338,397,404,444,445,494,544,594,601,644,707,
          757,812,819,867,937,1002,1003,1067,1074,1132,1197,1262,1327,1334,
          1392,1457,1522,1523,1587,1594,1652,1717,1782,1847,1854,1907,1972,
          2037,2102,2162,2177,2292,2422,2552,2673,2678,2797,2911,3042,3085]
    */

    getEpisode(episodeNumber, (err, episode) => {
      if (err || !episode.e) {
        dictionary.cache((cacheErr) => {
          if (cacheErr) throw cacheErr;
          getEpisodeFromCache((getErr, val) => {
            if (getErr) throw getErr;
            $('body').prepend(actionDrawerTmpl({ episodeNumber: val.e }));
            $('#episodenumber').text(val.e);
            $('#score').html(scoreTmpl());
            $('#container').html(lettersTmpl()).parent().fadeIn('fast');
            buttonBar.show($('#buttons'), { round: 'letters', placing: true });
            console.log(`Episode: ${val.e}`);
            startGame(val, vs, local.getName());
          });
        });
      } else {
        $('body').prepend(actionDrawerTmpl({ episodeNumber }));
        $('#episodenumber').text(episodeNumber);
        $('#score').html(scoreTmpl());
        $('#container').html(lettersTmpl()).parent().fadeIn('fast');
        buttonBar.show($('#buttons'), { round: 'letters', placing: true });
        console.log(`Episode: ${episodeNumber}`);
        startGame(episode, vs, local.getName());
      }
    });

    e.preventDefault();
  });

  $('#buttons')
    .on('click', '#goWord', () => {
      timer.enableNoSleep();
      letterRound.declare($('#word').val().toUpperCase(), playRound);
    })
    .on('click', '#undoLetter', () => {
      letterRound.undo();
    })
    .on('click', '#undoConundrumLetter', () => {
      conundrumRound.undo();
    })
    .on('click', '#declarebtn', (e) => {
      timer.stop();
      letterRound.goToDeclare(true);
      e.preventDefault();
      e.stopPropagation();
    })
    .on('click', '#goNumber', (e) => {
      timer.stop();
      numberRound.declare($('#number').val(), playRound);
      e.preventDefault();
      e.stopPropagation();
    })
    .on('click', '#goConundrum', () => {
      conundrumRound.declare($('#conundrum').val());
    });
  $('#container')
    .on('click', '#goNumberNothing', (e) => {
      timer.stop();
      numberRound.declare('', playRound);
      e.preventDefault();
      e.stopPropagation();
    })
    .on('click', '.letter-declare .tile', function (e) {
      letterRound.declareWordLength($(this).text());
    })
    .on('keydown', '#word', (e) => {
      if (e.keyCode === 13) $('#goWord').click();
    })
    .on('keydown', '#number', (e) => {
      if (e.keyCode === 13) $('#goNumber').click();
    })
    .on('click', '#buzz', () => {
      $('.conundrum-buzz').hide();
      $('.conundrum-declare').show();
      conundrumRound.buzz();
    })
    .on('keydown', '#conundrum', (e) => {
      if (e.keyCode === 13) $('#goConundrum').click();
    });

  $('body')
    .on('click', '.action-drawer', (e) => {
      if ($(e.target).is('.action-drawer')) {
        timer.resume();
        actionDrawer.close();
      }
    })
    .on('click', '#resumebtn', () => {
      timer.resume();
      actionDrawer.close();
    })
    .on('click', '#savebtn', () => {
      // save game
    })
    .on('click', '#feedbackbtn', () => {
      // open form for feedback
    })
    .on('click', '#quitbtn', () => {
      location.reload();
    });

  $('#reset').on('click', (e) => {
    resetCache();
    e.preventDefault();
  });

  // Temp for trying out different interfaces
  const display = location.href.split('?').splice(1);
  if (display.length > 0) {
    const els = display[0].split('&');
    let tmp;
    switch (els[0][0]) {
      case 'n':
        tmp = numbersTmpl({target: 200,});
        break;
      case 'l':
        tmp = lettersTmpl();
        break;
      default:
        tmp = conundrumTmpl();
    }
    $('#container').html(tmp);
    if (els.length > 1 && els[1][0] === 's') $('#container').find('*').show();
  }
};

module.exports = {init: initialise,};
