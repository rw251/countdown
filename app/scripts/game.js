/* jshint node: true */
/* global location */

var speech = require('./speech')
var numberRound = require('./numbers')
var letterRound = require('./letters')
var conundrumRound = require('./conundrum')
var timer = require('./timer')
var score = require('./score')
var local = require('./local')
var $ = require('jquery')
var localforage = require('localforage')
var dictionary = require('./dictionary')
var actionDrawer = require('./actionDrawer')

var tmpl = {
  letters: require('templates/letters'),
  numbers: require('templates/numbers'),
  conundrum: require('templates/conundrum'),
  feed: require('templates/feed'),
  score: require('templates/score'),
  welcome: require('templates/welcome'),
  actionDrawer: require('templates/action-drawer')
}

var c1
var c2
var rows
var name
var round = -1
var switcheroo = false
var skipLetters = true
var skipNumbers = false
var skipConundrums = false
var gameRecord = []
var episode

var startGame = function(episode, vs, player) {
  rows = episode.r
  name = player
  c1 = episode.p1.n
  c2 = episode.p2.n
  var isChampWinner = episode.p1.s > episode.p2.s

  if (vs === 'cham') {
    // all fine
  } else if (vs === 'chal') {
    c1 = c2
  } else if (vs === 'winn') {
    c1 = isChampWinner ? c1 : c2
  } else if (vs === 'lose') {
    c1 = isChampWinner ? c2 : c1
  } else if (vs === 'rand') {
    c1 = Math.random() > 0.5 ? c1 : c2
  } else if (vs === 'both') {
    score.c2first = c2.split(' ')[0]
    $('#c2').text(score.c2first + ': ')
  }
  if (c1 === c2) switcheroo = true

  score.c1first = c1.split(' ')[0]

  $('#p1').text(name + ': ')
  $('#c1').text(score.c1first + ': ')

  speech.say([{
    what: speech.WELCOME,
    who: 'nick'
  }, {
    what: speech.WHO + player + ' and ' + c1 + (score.c2first ? ' and ' + c2 + '.' : '.'),
    who: 'nick'
  }], function() {
    playRound()
  })
}

var playRound = function(lastRound, save) {
  if (lastRound) gameRecord.push(lastRound)

  if (save) {
    localforage.getItem('gamelist', function(err, val) {
      if (err) console.log(err)
      val = val || []
      val.push(episode)
      localforage.setItem('gamelist', val)
      localforage.setItem('' + episode, gameRecord, function(err) {
        if (err) console.log(err)
      })
    })

    return
  }

  var cont

  timer.reset()
  // $('.page').hide();
  // $('#clock-score').show();
  // $('.letter-board .tileInner').html("");
  // $('.number-board .tileInner').html("");
  // $('.nslot').html("&nbsp;");
  round++
  score.update()

  // $('#test').html(rows[round]);

  if (rows[round].hasOwnProperty('s') && !skipConundrums) {
    // con
    conundrumRound.load(rows[round], switcheroo, playRound)

    $('#container').html(tmpl.conundrum())

    speech.say("So finally it's time for the conundrum.  Fingers on buzzers as we reveal, today's, countdown conundrum.", 'nick', function() {
      conundrumRound.do(score.c1first)
    })
  } else if (rows[round].hasOwnProperty('l') && !skipLetters) {
    // letters
    $('#container').html(tmpl.letters())

    letterRound.load(rows[round], switcheroo)
    cont = ([1, 2, 5, 6, 8, 9, 12, 13, 14, 15].indexOf(round) % 2 === 0 ? score.c1first : name)

    speech.say('Ok, ' + cont + speech.LETTERS, 'NICK', function() {
      letterRound.do(cont)
    })
  } else if (rows[round].hasOwnProperty('n') && !skipNumbers) {
    // numbers
    cont = ([3, 7, 10, 16].indexOf(round) % 2 === 0 ? score.c1first : name)
    numberRound.load(rows[round], switcheroo)

    $('#container').html(tmpl.numbers({
      target: +numberRound.getTarget()
    }))

    speech.say('Ok, ' + cont + speech.NUMBERS, 'NICK', function() {
      numberRound.do(cont)
    })
  } else {
    // Tea time teaser
    playRound()
  }
}

var cacheEpisode = function(episode, callback) {
  localforage.getItem('cachedEpisodes', function(err, val) {
    if (err) return callback(err)
    val = val || []
    val.push(episode)
    localforage.setItem('cachedEpisodes', val, function(err) {
      if (err) return callback(err)
      callback()
    })
  })
}

var getEpisode = function(episodeNumber, callback) {
  $
    // .get('down.php?episode=' + episodeNumber)
    .get('episode.php?e=' + episodeNumber)
    .success(function(doc) {
      callback(null, JSON.parse(doc))
    }).error(function(jqXHR, textStatus, err) {
      return callback(new Error(err))
    })
}

var getRandomEpisode = function(callback) {
  localforage.getItem('gamelist', function(err, val) {
    if (err) throw err
    val = val || []
    var r = Math.floor(Math.random() * 5000) + 1000

    while (val.indexOf(r) > -1) {
      r = Math.floor(Math.random() * 5000) + 1000
    }

    getEpisode(r, function(err, val) {
      if (err) return callback(err)
      return callback(null, val)
    })
  })
}

var numberOfCachedGames = function(callback) {
  localforage.getItem('cachedEpisodes', function(err, val) {
    if (err) return callback(err)
    val = val || []
    console.log(val.length + ' cached episodes.')
    return callback ? callback(null, val.length) : val
  })
}

var refillCachedGames = function(limit, callback) {
  numberOfCachedGames(function(err, val) {
    if (err) return callback(err)
    if (val < limit) {
      getRandomEpisode(function(err, val) {
        if (err) return callback(err)
        if (!val.e) refillCachedGames(limit, callback)
        else {
          cacheEpisode(val, function() {
            refillCachedGames(limit, callback)
          })
        }
      })
    } else {
      return callback()
    }
  })
}

var resetCache = function() {
  localforage.getItem('cachedEpisodes', function(err, val) {
    if (err) console.log(err)
    val = []
    console.log('Resetting cache...')
    localforage.setItem('cachedEpisodes', val, function(err, val) {
      if (err) console.log(err)
      console.log('Cache reset.')
      refillCachedGames(10, function() {})
    })
  })
}

var getEpisodeFromCache = function(callback) {
  localforage.getItem('cachedEpisodes', function(err, val) {
    if (err) return callback(err)
    var episode = val.pop()
    localforage.setItem('cachedEpisodes', val, function(err, val) {
      if (err) return callback(err)
      return callback(null, episode)
    })
  })
}

var initialise = function() {
  numberOfCachedGames()
  refillCachedGames(10, function() {})

  $('#container').html(tmpl.welcome(local.settings))
  score.me = 0
  score.c1 = 0
  score.c2 = 0

  $('#episode').keydown(function(e) {
    if (e.keyCode === 13) $('#go').click()
  })

  $('#go').on('click', function(e) {
    $(this).text('Loading...').prop('disabled', true)

    timer.enableNoSleep()
    var vs = $('select[name=player]').val()
    episode = $('#episode').val()
    episode = episode === '' ? Math.floor(Math.random() * 5000) + 1000 : episode

    speech.silent = !$('#setting-speech').is(':checked')
    speech.speed = +$('[name=setting-speed]:checked').val()
    timer.LENGTH = +$('#setting-clock').val()
    timer.reset()
    skipLetters = !$('#setting-inc-letters').is(':checked')
    skipNumbers = !$('#setting-inc-numbers').is(':checked')
    skipConundrums = !$('#setting-inc-conundrum').is(':checked')
    $('#container').parent().fadeOut('slow')

    /*
     LLNLLNLLNLLLLNC - 5666 -
     LLLLNLLLLNLLLNC - 3086 - 5665
     LLLNLLLNC       - 1    - 3086
     LLNLLNCLLNLLNC  - 14 round (grand finals / CoCs / 2 specials) [80,132,184,234,288,338,397,404,444,445,494,544,594,601,644,707,757,812,819,867,937,1002,1003,1067,1074,1132,1197,1262,1327,1334,1392,1457,1522,1523,1587,1594,1652,1717,1782,1847,1854,1907,1972,2037,2102,2162,2177,2292,2422,2552,2673,2678,2797,2911,3042,3085]
    */

    getEpisode(episode, function(err, val) {
      if (err || !val.e) {
        dictionary.cache(function(err, val) {
          if (err) throw err
          getEpisodeFromCache(function(err, val) {
            if (err) throw err
            $('body').prepend(tmpl.actionDrawer())
            $('#episodenumber').text(val.e)
            $('#feed').html(tmpl.feed())
            $('#score').html(tmpl.score())
            $('#container').html(tmpl.letters()).parent().fadeIn('fast')
            startGame(val, vs, 'richard')
          })
        })
      } else {
        $('body').prepend(tmpl.actionDrawer())
        $('#episodenumber').text(episode)
        $('#feed').html(tmpl.feed())
        $('#score').html(tmpl.score())
        $('#container').html(tmpl.letters()).parent().fadeIn('fast')
        startGame(val, vs, 'richard')
      }
    })

    e.preventDefault()
  })

  $('#container').on('click', '#goWord', function() {
    timer.enableNoSleep()
    letterRound.declare($('#word').val().toUpperCase(), playRound)
  }).on('click', '#undoLetter', function() {
    letterRound.undo()
  }).on('click', '#undoConundrumLetter', function() {
    conundrumRound.undo()
  }).on('click', '#goNumber', function(e) {
    timer.isPaused = true
    timer.enableNoSleep()
    numberRound.declare($('#number').val(), playRound)
    e.preventDefault()
    e.stopPropagation()
  }).on('click', '#goNumberNothing', function(e) {
    timer.isPaused = true
    timer.enableNoSleep()
    numberRound.declare('', playRound)
    e.preventDefault()
    e.stopPropagation()
  }).on('click', '.letter-declare .tile', function(e) {
    letterRound.declareWordLength($(this).text())
  }).on('keydown', '#word', function(e) {
    if (e.keyCode === 13) $('#goWord').click()
  }).on('keydown', '#number', function(e) {
    if (e.keyCode === 13) $('#goNumber').click()
  }).on('click', '#buzz', function() {
    $('.conundrum-buzz').hide()
    $('.conundrum-declare').show()
    conundrumRound.buzz()
  }).on('click', '#goConundrum', function() {
    conundrumRound.declare($('#conundrum').val())
  }).on('keydown', '#conundrum', function(e) {
    if (e.keyCode === 13) $('#goConundrum').click()
  })

  $('body').on('click', '#pausebtn', function() {
    timer.isPaused = true
    timer.enableNoSleep()
    actionDrawer.open()
  }).on('click', '.action-drawer', function(e){
    if($(e.target).is('.action-drawer')) {
      timer.isPaused = false
      timer.enableNoSleep()
      actionDrawer.close()
    }
  }).on('click', '#resumebtn', function() {
    timer.isPaused = false
    timer.enableNoSleep()
    actionDrawer.close()
  }).on('click', '#savebtn', function() {
    //save game
  }).on('click', '#feedbackbtn', function() {
    //open form for feedback
  }).on('click', '#infobtn', function() {
    //show game info in pop over
  }).on('click', '#quitbtn', function() {
    location.reload()
  })

  $('#reset').on('click', function(e) {
    resetCache()
    e.preventDefault()
  })

  // Temp for trying out different interfaces
  var display = location.href.split('?').splice(1)
  if (display.length > 0) {
    var els = display[0].split('&')
    var tmp
    switch (els[0][0]) {
      case 'n':
        tmp = require('templates/numbers')({
          target: 200
        })
        break
      case 'l':
        tmp = require('templates/letters')()
        break
      default:
        tmp = require('templates/conundrum')()
    }
    $('#container').html(tmp)
    if (els.length > 1 && els[1][0] === 's') $('#container').find('*').show()
  }
}

module.exports = {
  init: initialise
}
