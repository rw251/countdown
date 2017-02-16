var $ = require('jquery')

var offlineDictionary

var cacheDictionary = function (callback) {
  $
    .getJSON('dictionary.json')
    .success(function (dic) {
      offlineDictionary = dic
      return callback(null, dic.length)
    })
    .error(function (jqXHR, textStatus, err) {
      return callback(new Error(err))
    })
}

var isValidWord = function (word, length, letters, callback) {
  if (word.length !== +length) return callback(false)

  var enoughLetters = true
  word.split('').forEach(function (c) {
    if (letters.indexOf(c) > -1) {
      letters = letters.replace(new RegExp(c, 'i'), '')
    } else {
      enoughLetters = false
    }
  })

  if (!enoughLetters) return callback(false)

  if (offlineDictionary) {
    return callback(word.length <= 4 || offlineDictionary.indexOf(word.toLowerCase()) > -1)
  }

  $.getJSON('check.php?word=' + word, function (data) {
    if (data.match) {
      callback(true)
    } else {
      callback(false)
    }
  }).done(function () {

  }).fail(function () {

  }).always(function () {

  })
}

module.exports = {
  isValidWord: isValidWord,
  cache: cacheDictionary
}
