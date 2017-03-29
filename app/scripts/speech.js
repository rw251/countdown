const $ = require('jquery');

const isFunction = function isFunction(functionToCheck) {
  const getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
};

const speech = {
  WELCOME: ' Good ', // "Good afternoon. It's time for another episode of Countdown.",
  WHO: " It's ", // "Who do we have today? It's ",
  THIRTY: ' Go! ', // "Ok, 30 seconds start now."
  LETTERS: ' Letters ', // ", it's your letters game.",
  NUMBERS: ' Numbers ', // ", it's your numbers game."
};

speech.speed = 300;

function sayLots(texts, callback) {
  if (texts.length > 0) {
    const text = texts.shift();
    say(text.what, text.who, () => {
      say(texts, callback);
    });
  } else {
    callback();
  }
}

const nameCache = {};

function getGender(name, callback) {
  if (nameCache[name.toLowerCase()]) {
    return callback(nameCache[name.toLowerCase()]);
  }
  let respGender = 'male';
  $.getJSON(`https://api.genderize.io/?name=${name.toLowerCase()}`, (resp) => {
    respGender = resp.gender;
    nameCache[name.toLowerCase()] = resp.gender;
  })
        .fail(() => {

        })
        .always(() => {
          callback(respGender);
        });
}

function say(text, who, callback) {
  if (!callback && isFunction(who)) {
    return sayLots(text, who);
  }

  if (speech.silent) {
    setTimeout(callback, speech.speed);
  } else {
    window.speechSynthesis.getVoices();

    getGender(who, (gender) => {
      msg.voice = gender === 'female' ? femaleVoice : maleVoice;
      msg.text = text;
      msg.rate = (1000 - speech.speed) / 500;

      if (who.toLowerCase() !== 'nick') {
        msg.pitch = 0;
        msg.rate = (1000 - speech.speed) / 400;
      }

      msg.onend = null;
      if (callback) {
        msg.onend = function (e) {
          callback();
        };
      }

      window.speechSynthesis.speak(msg);
    });
  }
}

if ('speechSynthesis' in window) {
  var msg = new window.SpeechSynthesisUtterance();
  msg.lang = 'en-GB';
  var maleVoice;
  var femaleVoice;

  window.speechSynthesis.onvoiceschanged = function () {
    window.speechSynthesis.getVoices();
    maleVoice = window.speechSynthesis.getVoices().filter(v => v.lang === 'en-GB' && v.name.indexOf('Male') > -1)[0];
    femaleVoice = window.speechSynthesis.getVoices().filter(v => v.lang === 'en-GB' && v.name.indexOf('Female') > -1)[0];
  };

  window.speechSynthesis.getVoices();
  speech.available = true;
  speech.silent = false;
} else {
  speech.available = false;
  speech.silent = true;
}

speech.say = say;

module.exports = speech;
