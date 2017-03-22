var speech = require('./speech.js')
var timer = require('./timer.js')
var local = require('./local.js')
var score = require('./score.js')
var dictionary = require('./dictionary.js')
var $ = require('jquery')
var msg = require('./message')
var buttonBar = require('./buttonBar')

var letters, wordLength

var lettersRound = {

  load: function(val, switcheroo) {
    var rtn = {}

    rtn.letters = val.l
    rtn.lettersClone = rtn.letters
    rtn.oLetters = val.l + ''
    rtn.c1 = val['1']
    rtn.c2 = val['2']
    rtn.c1valid = !val['1-bad']
    rtn.c2valid = !val['2-bad']

    if (rtn.c1.toUpperCase() !== rtn.c1) {
      rtn.c1valid = false
      rtn.c1 = rtn.c1.substr(0, rtn.c1.length - 2).trim().toUpperCase()
    }
    if (rtn.c2.toUpperCase() !== rtn.c2) {
      rtn.c2valid = false
      rtn.c2 = rtn.c2.substr(0, rtn.c2.length - 2).trim().toUpperCase()
    }

    rtn.othersC = val.c || []
    rtn.othersD = val.d || []
    rtn.others = rtn.othersC.concat(rtn.othersD)

    if (switcheroo) {
      rtn.c3 = rtn.c1
      rtn.c1 = rtn.c2
      rtn.c2 = rtn.c3
      rtn.c3valid = rtn.c1valid
      rtn.c1valid = rtn.c2valid
      rtn.c2valid = rtn.c3valid
    }

    letters = rtn
  },

  do: function(contestant) {
    $('.letter-grid').removeClass("letter-grid-small")
    if (letters.letters.length > 0) {
      var letter = letters.letters[0]
      letters.letters = letters.letters.substr(1)

      var start = 'Hi Rachel, can I have a '
      var end = letters.letters.length === 8 || letters.letters.length === 0 ? ' please?' : '?'
      if (letters.letters.length === 0) {
        start = 'And a final '
      } else if (letters.letters.length < 8) {
        start = 'A '
      }

      speech.say(start + (letter.search(/[AEIOU]/) > -1 ? 'vowel' : 'consonant') + end, contestant, function() {
        $('.tile')[8 - letters.letters.length].innerText = letter
        speech.say(letter, 'Rachel', function() {
          lettersRound.do(contestant)
        })
      })
    } else {
      msg.show("Go!");
      speech.say(speech.THIRTY, 'nick', function() {
        timer.start(function() {
          speech.say("Time's up. So what do you have?", 'nick')
          msg.show("Time's up. How long?")
          $('.letter-declare').removeClass("hidden")
          $('body').on('keydown', function(e) {
            var k = e.keyCode
            if (k >= 49 && k <= 57) {
              lettersRound.declareWordLength(k - 48);
            }
            e.preventDefault()
          })
          $('.letter-grid').addClass("hidden")
        })
      })
    }
  },

  declare: function(word, playRound) {
    $('.word-declare').hide()

    msg.show(require('../templates/declare')({ p1: word, p2: letters.c1 }));

    $('body').off('keydown')
    $('.tile').removeClass('slot-hover').off('click').parent().removeClass('slot-done')
    speech.say([{
      what: word,
      who: local.getName()
    }, {
      what: letters.c1,
      who: score.c1first
    }], function() {
      if (score.c2first) {
        // 3p game
        speech.say(letters.c2, score.c2first, function() {
          speech.say('Dictionary corner?', 'nick', function() {
            dictionary.isValidWord(word, wordLength, letters.oLetters, function(isValid) {
              var words = [word]
              var valids = [isValid]
              if (word !== letters.c1) {
                words.push(letters.c1)
                valids.push(letters.c1valid)
              }
              if (score.c2first && words.indexOf(letters.c2) === -1) {
                words.push(letters.c2)
                valids.push(letters.c2valid)
              }

              var best = words.reduce(function(prev, cur, idx) {
                return valids[idx] ? Math.max(prev, cur.length) : prev
              }, 0)

              var phrase = valids.map(function(val, idx) {
                if (val) return words[idx] + ' is ok '
                else return words[idx] + " isn't there I'm afraid "
              }).join(' and ')
              speech.say(phrase, 'susie', function() {
                var tts = []
                var longest = letters.others.reduce(function(prev, cur) {
                  return Math.max(prev, cur.replace(/\*/, '').length)
                }, 0)
                if (longest <= best) {
                  tts.push({
                    what: "We can't beat that.",
                    who: 'susie'
                  })
                } else if (letters.others.length > 2) {
                  tts.push({
                    what: 'We found a few ' + longest + 's.',
                    who: 'susie'
                  })
                } else if (letters.others.length === 2) {
                  tts.push({
                    what: 'We found a couple of ' + longest + 's.',
                    who: 'susie'
                  })
                } else if (letters.others.length === 1) {
                  tts.push({
                    what: 'We found one ' + longest,
                    who: 'susie'
                  })
                }

                if (letters.othersD.length > 0) {
                  tts.push({
                    what: 'We got ' + letters.othersD.join(', '),
                    who: 'susie'
                  })
                }
                if (letters.othersC.length > 0) {
                  tts.push({
                    what: 'The computer got ' + letters.othersC.join(', '),
                    who: 'susie'
                  })
                }
                if (isValid && word.length === best) score.me += word.length + (best === 9 ? 9 : 0)
                if (letters.c1valid && letters.c1.length === best) score.c1 += letters.c1.length + (best === 9 ? 9 : 0)
                if (score.c2first && letters.c2valid && letters.c2.length === best) score.c2 += letters.c2.length + (best === 9 ? 9 : 0)
                speech.say(tts, function() {
                  playRound({
                    letters: letters.lettersClone,
                    what: [word, letters.c1, letters.c2],
                    valid: [isValid, letters.c1valid, letters.c2valid]
                  })
                })
              })
            })
          })
        })
      } else {
        // 2p game
        speech.say('Dictionary corner?', 'nick', function() {
          dictionary.isValidWord(word, wordLength, letters.oLetters, function(isValid) {
            var words = [word]
            var valids = [isValid]
            if (word !== letters.c1) {
              words.push(letters.c1)
              valids.push(letters.c1valid)
            }

            msg.show(require('../templates/declare')({ p1: word, p2: letters.c1, p1valid: isValid, p2valid: letters.c1valid, evaluated: true }));
            var best = words.reduce(function(prev, cur, idx) {
              return valids[idx] ? Math.max(prev, cur.length) : prev
            }, 0)

            var phrase = valids.map(function(val, idx) {
              if (val) return words[idx] + ' is ok '
              else return words[idx] + " isn't there I'm afraid "
            }).join(' and ')
            speech.say(phrase, 'susie', function() {
              var tts = []
              var longest = letters.others.reduce(function(prev, cur) {
                return Math.max(prev, cur.replace(/\*/, '').length)
              }, 0)
              if (longest <= best) {
                tts.push({
                  what: "We can't beat that.",
                  who: 'susie'
                })
              } else if (letters.others.length > 2) {
                tts.push({
                  what: 'We found a few ' + longest + 's.',
                  who: 'susie'
                })
              } else if (letters.others.length === 2) {
                tts.push({
                  what: 'We found a couple of ' + longest + 's.',
                  who: 'susie'
                })
              } else if (letters.others.length === 1) {
                tts.push({
                  what: 'We found one ' + longest,
                  who: 'susie'
                })
              }

              if (letters.othersD.length > 0) {
                tts.push({
                  what: 'We got ' + letters.othersD.join(', '),
                  who: 'susie'
                })
              }
              if (letters.othersC.length > 0) {
                tts.push({
                  what: 'The computer got ' + letters.othersC.join(', '),
                  who: 'susie'
                })
              }

              msg.show("We got: " + letters.others.slice(0, 2).join(", "));

              if (isValid && word.length === best) score.me += word.length + (best === 9 ? 9 : 0)
              if (letters.c1valid && letters.c1.length === best) score.c1 += letters.c1.length + (best === 9 ? 9 : 0)
              speech.say(tts, function() {
                playRound({
                  letters: letters.lettersClone,
                  what: [word, letters.c1, letters.c2],
                  valid: [isValid, letters.c1valid, letters.c2valid]
                })
              })
            })
          })
        })
      }
    })
  },

  iveGot: function(n) {
    return n === 8 ? "I've got an 8." : "I've got a " + n + '.'
  },

  doTile: function() {
    var t = $(this).text()
    $(this).parent().addClass('slot-done')
    $(this).off('click')
    $('.word-declare').find('input[type=text]').val($('.word-declare').find('input[type=text]').val() + t).focus()
    $('#wordalt').val($('#word').val())
    if (!lettersRound.tiles) lettersRound.tiles = [$(this)]
    else lettersRound.tiles.push($(this))
  },

  declareWordLength: function(length) {
    wordLength = length
    $('body').off('keydown').on('keydown', function(e) {
      var k = e.keyCode
      if (k > 90) k -= 32
      if (k >= 65 && k <= 90) {
        var elem = $('.tile-wrapper:not(.slot-done) .tile:contains(' + String.fromCharCode(k) + '):first')
        lettersRound.doTile.call(elem)
      } else if (e.keyCode === 8) {
        lettersRound.undo()
      } else if (e.keyCode === 13) {
        $('#goWord').click()
      }
      e.preventDefault()
    })
    $('.letter-declare').addClass("hidden");
    $('.letter-grid').removeClass("hidden").addClass("letter-grid-small");
    msg.show([
      { msg: require('../templates/declare')({ declaring: true, p1: "You: " + length, p2: score.c1first + ": " + letters.c1.length }), displayFor: 100 }
    ], function() {
      if (score.c2first) {
        // 3p game
        speech.say(lettersRound.iveGot(letters.c2.length), score.c2first, function() {
          speech.say('So, ' + local.getName() + ', what have you got?', 'nick')
          $('.word-declare').show().find('input[type=text]').val('').focus()
          buttonBar.show($('#buttons'), { round: "letters", declare: true })
        })
      } else {
        // 2p game
        speech.say('So, ' + local.getName() + ', what have you got?', 'nick')
        $('.word-declare').show().find('input[type=text]').val('').focus()
        buttonBar.show($('#buttons'), { round: "letters", declare: true })
      }
      $('.tile').on('click', lettersRound.doTile).addClass('slot-hover');
    });
  },

  undo: function() {
    if (lettersRound.tiles && lettersRound.tiles.length > 0) {
      var tile = lettersRound.tiles.pop()
      tile.parent().removeClass('slot-done')
      var newText = $('#word').val().substr(0, $('#word').val().length - 1)
      $('#word').val(newText).focus()
      $('#wordalt').val(newText)
      tile.on('click', function() {
        var t = $(this).text()
        $(this).parent().addClass('slot-done')
        $(this).off('click')
        $('.word-declare').find('input[type=text]').val($('.word-declare').find('input[type=text]').val() + t).focus()
        $('#wordalt').val($('#word').val())
        if (!lettersRound.tiles) lettersRound.tiles = [$(this)]
        else lettersRound.tiles.push($(this))
      })
    }
  }

}

module.exports = lettersRound
