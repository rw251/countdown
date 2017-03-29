let time = 30;
const $ = require('jquery');
const NoSleep = require('nosleep.js');

const noSleep = new NoSleep();

let timer;

const countdown = function countdown(finalCallback, buzz) {
  if (timer.isPaused) {
    timer.isPaused = false;
    return;
  }
  if (time - Math.floor(time) === 0) $('.clock').text(time);
  if (time === 0) {
    noSleep.disable();
    finalCallback();
  } else if (buzz && timer.LENGTH - time === buzz) {
    noSleep.disable();
    finalCallback();
  } else {
    time -= 0.25;
    setTimeout(() => {
      countdown(finalCallback, buzz);
    }, 250);
  }
};

timer = {

  LENGTH: 30,

  isPaused: false,

  enableNoSleep() {
    noSleep.enable();
  },

  start(callback) {
    timer.isPaused = false;
    countdown(callback);
  },

  reset() {
    time = timer.LENGTH;
    $('.clock').text(timer.LENGTH);
  },

  getTime() {
    return time;
  },

  conundrum(buzztime, callback) {
    countdown(callback, buzztime);
  },

};

module.exports = timer;
