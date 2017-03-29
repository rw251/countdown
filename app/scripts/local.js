const $ = require('jquery');

let l;

const save = function save() {
  window.localStorage.setItem('settings', JSON.stringify(l.settings));
};

const update = function update() {
  l.settings.name = $('#yourname').val();
  l.settings.silent = !$('#setting-speech').is(':checked');
  l.settings.speed = +$('[name=setting-speed]:checked').val();
  l.settings.timerlength = +$('#setting-clock').val();
  l.settings.skipLetters = !$('#setting-inc-letters').is(':checked');
  l.settings.skipNumbers = !$('#setting-inc-numbers').is(':checked');
  l.settings.skipConundrums = !$('#setting-inc-conundrum').is(':checked');
  save();
};

l = {

  getName() {
    return l.settings.name || 'Player 1';
  },

};

l.settings = window.localStorage.getItem('settings');

if (!l.settings) l.settings = {};
else l.settings = JSON.parse(l.settings);

/* if (l.settings.silent) $('#setting-speech').attr("checked", false);
if (l.settings.speed)
  $('[name=setting-speed][value=' + l.settings.speed + ']').attr("checked", true);
if (l.settings.timerlength) $('#setting-clock').val(l.settings.timerlength);
if (l.settings.skipLetters) $('#setting-inc-letters').attr("checked", false);
if (l.settings.skipNumbers) $('#setting-inc-numbers').attr("checked", false);
if (l.settings.skipConundrums) $('#setting-inc-conundrum').attr("checked", false); */

$('#container').on('change', '#setting-speech,#setting-inc-letters,#setting-inc-numbers,#setting-inc-conundrum,input:radio', () => {
  update();
});
$('#container').on('keyup mouseup', '#yourname, input[name=setting-speed], #setting-clock', () => {
  update();
});
module.exports = l;
