var speech = require('./speech.js'),
    timer = require('./timer.js'),
    score = require('./score.js'),
    dictionary = require("./dictionary.js");

var letters, wordLength;

var lettersRound = {

    load: function(val, switcheroo) {
        var rtn = {};

        rtn.letters = val.find('.lselection').text();
        rtn.oLetters = val.find('.lselection').text();
        rtn.c1 = val.find('.c1word').text().trim();
        rtn.c2 = val.find('.c2word').text().trim();
        rtn.c1valid = true;
        rtn.c2valid = true;

        if (rtn.c1.toUpperCase() !== rtn.c1) {
            rtn.c1valid = false;
            rtn.c1 = rtn.c1.substr(0, rtn.c1.length - 2).trim().toUpperCase();
        }
        if (rtn.c2.toUpperCase() !== rtn.c2) {
            rtn.c2valid = false;
            rtn.c2 = rtn.c2.substr(0, rtn.c2.length - 2).trim().toUpperCase();
        }

        rtn.others = val.find('.lothers').text().split(',').map(function(a) {
            return a.trim();
        });

        if (switcheroo) {
            rtn.c3 = rtn.c1;
            rtn.c1 = rtn.c2;
            rtn.c2 = rtn.c3;
            rtn.c3valid = rtn.c1valid;
            rtn.c1valid = rtn.c2valid;
            rtn.c2valid = rtn.c3valid;
        }

        letters = rtn;
    },

    do: function(contestant) {
        if (letters.letters.length > 0) {
            var letter = letters.letters[0];
            letters.letters = letters.letters.substr(1);

            var start = "Hi Rachel, can I have a ";
            var end = letters.letters.length === 8 || letters.letters.length === 0 ? " please?" : "?";
            if (letters.letters.length === 0) {
                start = "And a final ";
            }
            else if (letters.letters.length < 8) {
                start = "A ";
            }

            speech.say(start + (letter.search(/[AEIOU]/) > -1 ? "vowel" : "consonant") + end, contestant, function() {
                $('.tileInner')[8 - letters.letters.length].innerText = letter;
                speech.say(letter, "Rachel", function() {
                    lettersRound.do(contestant);
                });
            });
        }
        else {
            speech.say(speech.THIRTY, "nick", function() {
                timer.start(function() {
                    speech.say("Time's up. So what do you have?", "nick");
                    $('.letter-declare').show();
                    $('.letter-board').hide();
                });
            });
        }
    },


    declare: function(word, playRound) {
        $('.word-declare').hide();
        $('.tileInner').removeClass('slot-hover').off('click').parent().removeClass('slot-done');
        speech.say([{
            what: word,
            who: "Richard"
        }, {
            what: letters.c1,
            who: score.c1first
        }], function() {
            if (score.c2first) {
                //3p game
                speech.say(letters.c2, score.c2first, function() {
                    speech.say("Dictionary corner?", "nick", function() {
                        dictionary.isValidWord(word, wordLength, letters.oLetters, function(isValid) {
                            var words = [word];
                            var valids = [isValid];
                            if (word !== letters.c1) {
                                words.push(letters.c1);
                                valids.push(letters.c1valid);
                            }
                            if (score.c2first && words.indexOf(letters.c2) === -1) {
                                words.push(letters.c2);
                                valids.push(letters.c2valid);
                            }

                            var best = words.reduce(function(prev, cur, idx) {
                                return valids[idx] ? Math.max(prev, cur.length) : prev;
                            }, 0);

                            var phrase = valids.map(function(val, idx) {
                                if (val) return words[idx] + " is ok ";
                                else return words[idx] + " isn't there I'm afraid ";
                            }).join(" and ");
                            speech.say(phrase, "susie", function() {
                                var tts = [];
                                var longest = letters.others.reduce(function(prev, cur) {
                                    return Math.max(prev, cur.replace(/\*/, "").length);
                                }, 0);
                                if (longest <= best) tts.push({
                                    what: "We can't beat that.",
                                    who: "susie"
                                });
                                else if (letters.others.length > 2) tts.push({
                                    what: "We found a few " + longest + "s.",
                                    who: "susie"
                                });
                                else if (letters.others.length === 2) tts.push({
                                    what: "We found a couple of " + longest + "s.",
                                    who: "susie"
                                });
                                else if (letters.others.length === 1) tts.push({
                                    what: "We found one " + longest,
                                    who: "susie"
                                });

                                var dc = letters.others.filter(function(v) {
                                    return v.indexOf("*") < 0;
                                });
                                var ai = letters.others.filter(function(v) {
                                    return v.indexOf("*") > -1;
                                }).map(function(v) {
                                    return v.replace(/\*/, "");
                                });

                                if (dc.length > 0) {
                                    tts.push({
                                        what: "We got " + dc.join(", "),
                                        who: "susie"
                                    });
                                }
                                if (ai.length > 0) {
                                    tts.push({
                                        what: "The computer got " + ai.join(", "),
                                        who: "susie"
                                    });
                                }
                                if (isValid && word.length === best) score.me += word.length + (best === 9 ? 9 : 0);
                                if (letters.c1valid && letters.c1.length === best) score.c1 += letters.c1.length + (best === 9 ? 9 : 0);
                                if (score.c2first && letters.c2valid && letters.c2.length === best) score.c2 += letters.c2.length + (best === 9 ? 9 : 0);
                                speech.say(tts, function() {
                                    playRound();
                                });
                            });
                        });
                    });
                });
            }
            else {
                //2p game
                speech.say("Dictionary corner?", "nick", function() {
                    dictionary.isValidWord(word, wordLength, letters.oLetters, function(isValid) {
                        var words = [word];
                        var valids = [isValid];
                        if (word !== letters.c1) {
                            words.push(letters.c1);
                            valids.push(letters.c1valid);
                        }

                        var best = words.reduce(function(prev, cur, idx) {
                            return valids[idx] ? Math.max(prev, cur.length) : prev;
                        }, 0);

                        var phrase = valids.map(function(val, idx) {
                            if (val) return words[idx] + " is ok ";
                            else return words[idx] + " isn't there I'm afraid ";
                        }).join(" and ");
                        speech.say(phrase, "susie", function() {

                            var tts = [];
                            var longest = letters.others.reduce(function(prev, cur) {
                                return Math.max(prev, cur.replace(/\*/, "").length);
                            }, 0);
                            if (longest <= best) tts.push({
                                what: "We can't beat that.",
                                who: "susie"
                            });
                            else if (letters.others.length > 2) tts.push({
                                what: "We found a few " + longest + "s.",
                                who: "susie"
                            });
                            else if (letters.others.length === 2) tts.push({
                                what: "We found a couple of " + longest + "s.",
                                who: "susie"
                            });
                            else if (letters.others.length === 1) tts.push({
                                what: "We found one " + longest,
                                who: "susie"
                            });

                            var dc = letters.others.filter(function(v) {
                                return v.indexOf("*") < 0;
                            });
                            var ai = letters.others.filter(function(v) {
                                return v.indexOf("*") > -1;
                            }).map(function(v) {
                                return v.replace(/\*/, "");
                            });

                            if (dc.length > 0) {
                                tts.push({
                                    what: "We got " + dc.join(", "),
                                    who: "susie"
                                });
                            }
                            if (ai.length > 0) {
                                tts.push({
                                    what: "The computer got " + ai.join(", "),
                                    who: "susie"
                                });
                            }

                            if (isValid && word.length === best) score.me += word.length + (best === 9 ? 9 : 0);
                            if (letters.c1valid && letters.c1.length === best) score.c1 += letters.c1.length + (best === 9 ? 9 : 0);
                            speech.say(tts, function() {
                                playRound();
                            });
                        });
                    });
                });
            }
        });
    },

    iveGot: function(n) {
        return n === 8 ? "I've got an 8." : "I've got a " + n + ".";
    },

    declareWordLength: function(length) {
        wordLength = length;
        $('.letter-declare').hide();
        $('.letter-board').show();
        speech.say(lettersRound.iveGot(length), "Richard", function() {
            speech.say(lettersRound.iveGot(letters.c1.length), score.c1first, function() {
                if (score.c2first) {
                    //3p game
                    speech.say(lettersRound.iveGot(letters.c2.length), score.c2first, function() {
                        speech.say("So, Richard, what have you got?", "nick");
                        $('.word-declare').show().find('input[type=text]').val("").focus();
                    });
                }
                else {
                    //2p game
                    speech.say("So, Richard, what have you got?", "nick");
                    $('.word-declare').show().find('input[type=text]').val("").focus();
                }
                $('.tileInner').on('click', function() {
                    var t = $(this).text();
                    $(this).parent().addClass('slot-done');
                    $(this).off('click');
                    $('.word-declare').find('input[type=text]').val($('.word-declare').find('input[type=text]').val() + t).focus();
                    $('#wordalt').val($('#word').val());
                }).addClass('slot-hover');
            });
        });
    }

};

module.exports = lettersRound;