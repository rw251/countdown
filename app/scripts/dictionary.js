const $ = require('jquery');

let offlineDictionary;

const cacheDictionary = function cacheDictionary(callback) {
  $
    .getJSON('dictionary.json')
    .success((dic) => {
      offlineDictionary = dic;
      return callback(null, dic.length);
    })
    .error((jqXHR, textStatus, err) => callback(new Error(err)));
};

const isValidWord = function (word, length, letters, callback) {
  if (word.length !== +length) return callback(false);

  let enoughLetters = true;
  word.split('').forEach((c) => {
    if (letters.indexOf(c) > -1) {
      letters = letters.replace(new RegExp(c, 'i'), '');
    } else {
      enoughLetters = false;
    }
  });

  if (!enoughLetters) return callback(false);

  if (offlineDictionary) {
    return callback(word.length <= 4 || offlineDictionary.indexOf(word.toLowerCase()) > -1);
  }

  return $.getJSON(`check.php?word=${word}`, (data) => {
    if (data.match) {
      callback(true);
    } else {
      callback(false);
    }
  }).done(() => {
    // console.log('done');
  }).fail(() => {
    cacheDictionary(() => callback(word.length <= 4 ||
                                        offlineDictionary.indexOf(word.toLowerCase()) > -1));
  }).always(() => {
    // console.log('alwats');
  });
};

module.exports = {
  isValidWord,
  cache: cacheDictionary,
};
