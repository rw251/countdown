/* global localStorage */
var $ = require('jquery');

var save = function() {
  localStorage.setItem("settings", JSON.stringify(l.settings));
};

var update = function() {
  l.settings.silent = !$('#setting-speech').is(':checked');
  l.settings.speed = +$('[name=setting-speed]:checked').val();
  l.settings.timerlength = +$('#setting-clock').val();
  l.settings.skipLetters = !$('#setting-inc-letters').is(':checked');
  l.settings.skipNumbers = !$('#setting-inc-numbers').is(':checked');
  l.settings.skipConundrums = !$('#setting-inc-conundrum').is(':checked');
  save();
};

var l = {};

l.settings = localStorage.getItem("settings");

if (!l.settings) l.settings = {};
else l.settings = JSON.parse(l.settings);

/*if (l.settings.silent) $('#setting-speech').attr("checked", false);
if (l.settings.speed) $('[name=setting-speed][value=' + l.settings.speed + ']').attr("checked", true);
if (l.settings.timerlength) $('#setting-clock').val(l.settings.timerlength);
if (l.settings.skipLetters) $('#setting-inc-letters').attr("checked", false);
if (l.settings.skipNumbers) $('#setting-inc-numbers').attr("checked", false);
if (l.settings.skipConundrums) $('#setting-inc-conundrum').attr("checked", false);*/

$('#container').on('change', '#setting-speech,#setting-inc-letters,#setting-inc-numbers,#setting-inc-conundrum,input:radio', function(){
  update();
});
$('#container').on('keyup mouseup', 'input[name=setting-speed], #setting-clock', function() {
  update();
});
module.exports = l;