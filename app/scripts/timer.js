var time = 30
var $ = require('jquery')
var NoSleep = require('nosleep.js')
var noSleep = new NoSleep()

var countdown = function (finalCallback, buzz) {
  if (timer.isPaused) {
    timer.isPaused = false    
    return
  }
  if (time - Math.floor(time) === 0) $('.clock').text(time)
  if (time === 0) {
    noSleep.disable()
    finalCallback()
  } else if (buzz && timer.LENGTH - time === buzz) {
    noSleep.disable()
    finalCallback()
  } else {
    time -= 0.25
    setTimeout(function () {
      countdown(finalCallback, buzz)
    }, 250)
  }
}

var timer = {

  LENGTH: 30,

  isPaused: false,

  enableNoSleep: function () {
    noSleep.enable()
  },

  start: function (callback) {
    timer.isPaused = false
    countdown(callback)
  },

  reset: function () {
    time = timer.LENGTH
    $('.clock').text(timer.LENGTH)
  },

  getTime: function () {
    return time
  },

  conundrum: function (buzztime, callback) {
    countdown(callback, buzztime)
  }

}

module.exports = timer
