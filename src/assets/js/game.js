var speech = require("./speech.js"),
    dictionary = require("./dictionary.js");

speech.silent = true;
var c1, c2, c1first, c2first, rows, name, round = 1,
    letters, numbers, timerDefault = 1,
    timer = timerDefault,
    switcheroo = false,
    score = {},
    skipLetters = true,
    skipNumbers = false,
    skipConundrums = false;

var elClock, elWordLength, elWord, elNumber, elSlots, elNSlots, elCSlots;

var getLetters = function(val) {
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

    return rtn;
};

var getNumbers = function(val) {
    var rtn = {};

    var temp = val.find('.nselection').text().split('→');

    rtn.selection = temp[0].trim().split(' ');

    rtn.small = 0;
    rtn.large = 0;

    rtn.selection.forEach(function(n) {
        if (n > 10) rtn.large++;
        else rtn.small++;
    });

    rtn.say = rtn.large === 0 ? "6 small numbers" : rtn.large + " large number" + (rtn.large === 1 ? "" : "s") + " and " + rtn.small + " small ones";

    rtn.target = temp[1].replace(/[^0-9]/g, "");
    rtn.c1 = val.find('.c1nums').text().split('\n');
    rtn.c2 = val.find('.c2nums').text().split('\n');
    if (rtn.c1[0].indexOf('☓') > -1) {
        rtn.c1valid = false;
    }
    else if (rtn.c1[0].search(/[0-9]/) > -1 && rtn.c1.length > 1) {
        rtn.c1method = rtn.c1[1];
    }
    rtn.c1 = rtn.c1[0].replace(/[^0-9]/g, "");
    if (rtn.c2[0].indexOf('☓') > -1) {
        rtn.c2valid = false;
    }
    else if (rtn.c2[0].search(/[0-9]/) > -1 && rtn.c2.length > 1) {
        rtn.c2method = rtn.c2[1];
    }
    rtn.c2 = rtn.c2[0].replace(/[^0-9]/g, "");

    rtn.rachel = val.find('.nothers').text();

    if (switcheroo) {
        rtn.c3 = rtn.c1;
        rtn.c1 = rtn.c2;
        rtn.c2 = rtn.c3;
        rtn.c3valid = rtn.c1valid;
        rtn.c1valid = rtn.c2valid;
        rtn.c2valid = rtn.c3valid;
        rtn.c3method = rtn.c1method;
        rtn.c1method = rtn.c2method;
        rtn.c2method = rtn.c3method;
    }

    return rtn;
};

var getConundrum = function(val) {
    var rtn = {};

    rtn.conundrum = val.find('.cselection').text();
    var c1buzz = val.find('.c1buzz').text().trim();
    var c2buzz = val.find('.c2buzz').text().trim();
    var ans = val.find('.cothers').text().trim();
    var time = 60;

    if (c1buzz.length > 8) {
        console.log(c1buzz);
        ans = c1buzz;
        console.log(c1buzz.match(/\(([0-9\.]+) /));
        rtn.time = +c1buzz.match(/\(([0-9\.]+) /)[1];
        rtn.who = "c1";
    }
    else if (c2buzz.length > 8) {
        console.log(c2buzz);
        ans = c2buzz;
        console.log(c2buzz.match(/\(([0-9\.]+) /));
        rtn.time = +c2buzz.match(/\(([0-9\.]+) /)[1];
        rtn.who = "c2";
    }
    //cultivater ☓ 
    rtn.answer = ans.match(/[A-Z]{9}/)[0];

    if (switcheroo) {
        rtn.c3buzz = rtn.c1buzz;
        rtn.c1buzz = rtn.c2buzz;
        rtn.c2buzz = rtn.c3buzz;
        if (rtn.who === "c1") rtn.who = "c2";
        if (rtn.who === "c2") rtn.who = "c1";
    }

    return rtn;
};

var iveGot = function(n) {
    return n === 8 ? "I've got an 8." : "I've got a " + n + ".";
};

var wordLength = 0;

var declareWordLength = function(length) {
    wordLength = length;
    elWordLength.hide();
    speech.say(iveGot(length), "Richard", function() {
        speech.say(iveGot(letters.c1.length), c1first, function() {
            if (c2first) {
                //3p game
                speech.say(iveGot(letters.c2.length), c2first, function() {
                    speech.say("So, Richard, what have you got?", "nick");
                    elWord.show().find('input[type=text]').val("").focus();
                });
            }
            else {
                //2p game
                speech.say("So, Richard, what have you got?", "nick");
                elWord.show().find('input[type=text]').val("").focus();
            }
            $('.slot').on('click', function() {
                var t = $(this).text().toLowerCase();
                $(this).addClass('slot-done');
                $(this).off('click');
                elWord.find('input[type=text]').val(elWord.find('input[type=text]').val() + t).focus();
            }).addClass('slot-hover');
        });
    });
};

var updateScore = function() {
    $('#pscore').text(score.me);
    $('#c1score').text(score.c1);
    if (c2first) $('#c2score').text(score.c2);
};

var declareWord = function(word) {
    elWord.hide();
    $('.slot').removeClass('slot-done').removeClass('slot-hover').off('click');
    speech.say([{
        what: word,
        who: "Richard"
    }, {
        what: letters.c1,
        who: c1first
    }], function() {
        if (c2first) {
            //3p game
            speech.say(letters.c2, c2first, function() {
                speech.say("Dictionary corner?", "nick", function() {
                    dictionary.isValidWord(word, wordLength, letters.oLetters, function(isValid) {
                        var words = [word];
                        var valids = [isValid];
                        if (word !== letters.c1) {
                            words.push(letters.c1);
                            valids.push(letters.c1valid);
                        }
                        if (c2first && words.indexOf(letters.c2) === -1) {
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
                            if (c2first && letters.c2valid && letters.c2.length === best) score.c2 += letters.c2.length + (best === 9 ? 9 : 0);
                            speech.say(tts, function() {
                                round++;
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
                            round++;
                            playRound();
                        });
                    });
                });
            });
        }
    });
};

var checkNumber = function(number, callback) {
    if(number===0) return callback(false);
    $('#messedUp').on('click', function() {
        $('.nslot').off('click').removeClass('slot-selected slot-done slot-hover slot-changed');
        $('.calcslot').off('click').removeClass('slot-selected slot-done slot-hover slot-changed');
        $('.number-calc').hide();
        $('#messedUp').off('click');
        callback(false);
    });

    $('.number-calc').show();

    var n1, n2, nn1, nn2, symbol;

    var numclick = function() {
        if (symbol) {
            n2 = $(this);
            $(this).addClass('slot-selected');
            $(this).off('click');
            nn1 = +n1.text();
            nn2 = +n2.text();

            console.log(nn1, symbol.text(), nn2);

            if (symbol.data("operator") === "add") {
                n1.text(nn1 + nn2);
            }
            else if (symbol.data("operator") === "times") {
                n1.text(nn1 * nn2);
            }
            else if (symbol.data("operator") === "divide") {
                n1.text(nn1 / nn2);
            }
            else {
                n1.text(nn1 - nn2);
            }

            n1.on('click', numclick).removeClass('slot-selected').addClass('slot-hover slot-changed');
            n2.removeClass('slot-selected').addClass('slot-done');
            $('.calcslot').on('click', symclick).removeClass('slot-selected').addClass('slot-hover');


            if (+n1.text() === number) {
                $('.nslot').off('click').removeClass('slot-selected slot-done slot-hover slot-changed');
                $('.calcslot').off('click').removeClass('slot-selected slot-done slot-hover slot-changed');
                $('.number-calc').hide();
                $('#messedUp').off('click');
                callback(true);
            }

            n1 = null;
            n2 = null;
            symbol = null;

        }
        else if (!n1) {
            n1 = $(this);
            $(this).addClass('slot-selected');
            $(this).off('click');
        }
    };

    var symclick = function() {
        if (!n1) return;
        symbol = $(this);
        $(this).addClass('slot-selected');
        $('.calcslot').off('click');
    };

    $('.nslot').on('click', numclick).addClass('slot-hover');
    $('.calcslot').on('click', symclick).addClass('slot-hover');

    speech.say("Go on Richard, show us how it's done.", "nick", function() {

    });


};



var declareNumber = function(number) {
    elNumber.hide();

    number = +number;
    numbers.c1 = +numbers.c1;
    numbers.c2 = +numbers.c2;

    var points = numbers.target - number === 0 ? 10 : 7;
    var c1points = numbers.target - numbers.c1 === 0 ? 10 : 7;
    var c2points = numbers.target - numbers.c2 === 0 ? 10 : 7;

    var diff = {
        p: Math.abs(numbers.target - number),
        c1: Math.abs(numbers.target - numbers.c1),
        c2: Math.abs(numbers.target - numbers.c2)
    };

    var texts = [];
    texts.push({
        what: number === 0 ? "Sorry, I messed up." : number,
        who: "richard"
    });
    texts.push({
        what: numbers.c1method ? numbers.c1 : "Sorry, I messed up",
        who: c1first
    });
    if (c2first) texts.push({
        what: numbers.c2method ? numbers.c2 : "Sorry, I messed up",
        who: c2first
    });

    speech.say(texts, function() {
        checkNumber(number, function(isValid) {
            texts = [];
            var mindiff = Math.min(diff.p, Math.min(diff.c1, diff.c2));
            var winners = [];
            if (mindiff === diff.c1 && numbers.c1method) {
                winners.push(c1first);
                score.c1 += c1points;
            }
            if (c2first && mindiff === diff.c2 && numbers.c2method) {
                score.c2 += c2points;
                winners.push(c2first);
            }

            if (!isValid && number > 0) {
                texts.push({
                    what: "Sorry, Richard, but you've gone wrong.",
                    who: "rachel"
                });
            }
            else {
                if (mindiff === diff.p) {
                    score.me += points;
                    winners.push("richard");
                }
            }

            console.log(numbers.rachel);

            if (winners.length === 0) {
                speech.say("So no-one got it. Never mind.", "nick", function() {
                    round++;
                    playRound();
                });
            }
            else if (winners.length === 1) {
                speech.say("Well done " + winners[0], "nick", function() {
                    round++;
                    playRound();
                });
            }
            else if (winners.length === 2 && c2first) {
                speech.say("Well done " + winners.join(" and "), "nick", function() {
                    round++;
                    playRound();
                });
            }
            else {
                speech.say("Well done everyone.", "nick", function() {
                    round++;
                    playRound();
                });
            }
        });
    });
};

var startGame = function(r, vs, player) {
    //detect format
    var x = r.toArray().map(function(val) {
        if ($(val).find('.lselection').length > 0) {
            return "L";
        }
        else if ($(val).find('.nselection').length > 0) {
            return "N";
        }
        else if ($(val).find('.cselection').length > 0) {
            return "C";
        }
        else {
            return "";
        }
    });

    rows = r;
    name = player;
    c1 = $(rows[0]).find('.c1word').text();
    c2 = $(rows[0]).find('.c2word').text();
    var finalScores = $(rows[rows.length - 1]).find('.score').text().split(/[^0-9]/).map(function(v) {
        return +v;
    });
    var isChampWinner = finalScores[0] > finalScores[1];

    if (vs === "cham") {
        //all fine
    }
    else if (vs === "chal") {
        c1 = c2;
    }
    else if (vs === "winn") {
        c1 = isChampWinner ? c1 : c2;
    }
    else if (vs === "lose") {
        c1 = isChampWinner ? c2 : c1;
    }
    else if (vs === "rand") {
        c1 = Math.random() > 0.5 ? c1 : c2;
    }
    else if (vs === "both") {
        c2first = c2.split(' ')[0];
        $('#c2').text(c2first + ": ");
    }
    if (c1 === c2) switcheroo = true;

    c1first = c1.split(' ')[0];

    $('#p1').text(name + ": ");
    $('#c1').text(c1first + ": ");

    speech.say([{
        what: speech.WELCOME,
        who: "nick"
    }, {
        what: speech.WHO + player + " and " + c1 + (c2first ? " and " + c2 + "." : "."),
        who: "nick"
    }], function() {
        playRound();
    });
};


var countdown = function(finalCallback) {
    if (timer === 0) {
        elClock.text(timer);
        finalCallback();
    }
    else {
        elClock.text(timer);
        timer--;
        setTimeout(function() {
            countdown(finalCallback);
        }, 1000);
    }
}


var doLetter = function(contestant) {
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
            elSlots[8 - letters.letters.length].innerText = letter;
            speech.say(letter, "Rachel", function() {
                doLetter(contestant);
            });
        });
    }
    else {
        timer = timerDefault;
        speech.say(speech.THIRTY, "nick", function() {
            countdown(function() {
                speech.say("Time's up. So what do you have?", "nick");
                elWordLength.show();
            });
        });
    }
};

var doConundrum = function() {
    letters.conundrum.split("").forEach(function(l, i) {
        $(elCSlots[i]).text(l);
    });
    timer = timerDefault;
    countdown(function() {
        speech.say("Time's up.", "nick", function() {
            letters.answer.split("").forEach(function(l, i) {
                $(elSlots[i]).text(l);
            });
        });
    });
};

var doNumber = function(contestant) {
    if (numbers.selection.length === 6) {
        var number = numbers.selection.pop();
        speech.say("Hi Rachel, can I have " + numbers.say + " please.", contestant, function() {
            elNSlots[5].innerText = number;
            speech.say(number, "Rachel", function() {
                doNumber(contestant);
            });
        });
    }

    else if (numbers.selection.length > 0) {
        var number = numbers.selection.pop();
        elNSlots[numbers.selection.length].innerText = number;
        speech.say(number, "Rachel", function() {
            doNumber(contestant);
        });
    }
    else {
        speech.say("And the target is...", "rachel", function() {
            $('.target').text(numbers.target);
            speech.say(numbers.target, "rachel", function() {
                timer = timerDefault;
                speech.say(speech.THIRTY, "nick", function() {
                    countdown(function() {
                        speech.say("Time's up. So what do you have?", "nick");
                        elNumber.show().find('input[type=text]').val("").focus();
                    });
                });
            });
        });
    }
};

var playRound = function() {
    $('.page').hide();
    elSlots.html("&nbsp;");
    elNSlots.html("&nbsp;");

    updateScore();

    $('#test').html(rows[round]);

    if ($(rows[round]).find('.lselection').length > 0 && !skipLetters) {
        //letters
        $('#letters-page').show();

        letters = getLetters($(rows[round]));
        var cont = ([1, 2, 5, 6, 8, 9, 12, 13, 14, 15].indexOf(round) % 2 === 0 ? c1first : name);

        speech.say("Ok, " + cont + speech.LETTERS, "NICK", function() {
            doLetter(cont);
        });
    }
    else if ($(rows[round]).find('.nselection').length > 0 && !skipNumbers) {
        //numbers
        $('.target').text("000");
        $('#numbers-page').show();
        var cont = ([3, 7, 10, 16].indexOf(round) % 2 === 0 ? c1first : name);
        numbers = getNumbers($(rows[round]));

        speech.say("Ok, " + cont + speech.NUMBERS, "NICK", function() {
            doNumber(cont);
        });
    }
    else if ($(rows[round]).find('.cselection').length > 0 && !skipConundrums) {
        //con
        $('#conundrum-page').show();
        letters = getConundrum($(rows[round]));

        $('.conundrum-buzz').show();

        speech.say("So finally it's time for the conundrum.  Fingers on buzzers as we reveal, today's, countdown conundrum.", "nick", function() {
            doConundrum();
        });
    }
    else {
        //Tea time teaser
        round++;
        playRound();
    }
}

var initialise = function(clock, slots, nslots, cslots, wordLengthDeclare, wordDeclare, numberDeclare) {
    elClock = clock;
    elSlots = slots;
    elNSlots = nslots;
    elCSlots = cslots;
    elWordLength = wordLengthDeclare;
    elWord = wordDeclare;
    elNumber = numberDeclare;

    score.me = 0;
    score.c1 = 0;
    score.c2 = 0;
};

module.exports = {
    letters: getLetters,
    numbers: getNumbers,
    conundrum: getConundrum,
    start: startGame,
    declare: {
        wordLength: declareWordLength,
        word: declareWord,
        number: declareNumber
    },
    init: initialise
};