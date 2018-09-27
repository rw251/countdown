let time = 30;
const $ = require('jquery');
const NoSleep = require('nosleep.js');

const noSleep = new NoSleep();

let timer;

const countdown = function countdown(finalCallback, buzz) {
  if (timer.isStopped) {
    timer.isStopped = false;
    timer.isPaused = false;
    timer.hasStarted = false;
    return;
  }
  if (timer.isPaused) {
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
  hasStarted: false,

  currentCallback: {},

  enableNoSleep() {
    noSleep.enable();
  },

  start(callback) {
    timer.hasStarted = true;
    timer.isPaused = false;
    timer.currentCallback = callback;
    countdown(callback);
  },

  reset() {
    timer.hasStarted = false;
    timer.isStopped = false;
    time = timer.LENGTH;
    $('.clock').text(timer.LENGTH);
  },

  pause() {
    timer.isPaused = true;
    timer.enableNoSleep();
  },

  stop() {
    timer.isStopped = true;
    timer.enableNoSleep();
  },

  resume() {
    timer.isPaused = false;
    if (timer.hasStarted) countdown(timer.currentCallback);
  },

  getTime() {
    return time;
  },

  conundrum(buzztime, callback) {
    timer.isPaused = false;
    countdown(callback, buzztime);
  },

};

module.exports = timer;
