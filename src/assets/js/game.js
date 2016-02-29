var speech = require("./speech.js"),
    dictionary = require("./dictionary.js");


var c1, c2, c1first, c2first, rows, name, round = 1,
    letters, numbers, timerDefault = 1,
    timer = timerDefault,
    score = {};

var elClock, elWordLength, elWord, elNumber, elSlots, elNSlots;

var getLetters = function(val) {
    var rtn = {};

    rtn.letters = val.find('.lselection').text(); //.substr(7);
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
        ans = c1buzz;
        rtn.time = +c1buzz.match(/\(([0-9\.]+) /)[1];
        rtn.who = "c1";
    }
    else if (c2buzz.length > 8) {
        ans = c2buzz;
        rtn.time = +c1buzz.match(/\(([0-9\.]+) /)[1];
        rtn.who = "c2";
    }
    //cultivater ☓ 
    rtn.answer = ans.match(/[A-Z]{9}/)[0];

    return rtn;
};


var declareWordLength = function(length) {
    elWordLength.hide();
    speech.say("I've got a " + length, "Richard", function() {
        speech.say("I've got " + letters.c1.length, c1first, function() {
            if (c2first) {
                //3p game
                speech.say("And I've got " + letters.c2.length, c2first, function() {
                    speech.say("So, Richard, what have you got?", "nick");
                    elWord.val("").show().focus();
                });
            }
            else {
                //2p game
                speech.say("So, Richard, what have you got?", "nick");
                elWord.val("").show().focus();
            }
        });
    });
};

var declareWord = function(word) {
    elWord.hide();
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
                    dictionary.isValidWord(word, function(isValid) {
                        var phrase = (isValid ? word + " is ok, " : word + " isn't there I'm afraid.") +
                            (letters.c1valid ? letters.c1 + " is ok, " : letters.c1 + " isn't there I'm afraid.") +
                            (letters.c2valid ? " and " + letters.c2 + " is ok, " : " and " + letters.c2 + " isn't there I'm afraid.");
                        speech.say(phrase, "susie", function() {
                            if (isValid) score.me += word.length;
                            if (letters.c1valid) score.c1 += letters.c1.length;
                            if (letters.c2valid) score.c2 += letters.c2.length;
                            round++;
                            playRound();
                        });
                    });
                });
            });
        }
        else {
            //2p game
            speech.say("Dictionary corner?", "nick", function() {
                dictionary.isValidWord(word, function(isValid) {
                    var phrase = (isValid ? word + " is ok, " : word + " isn't there I'm afraid.") +
                        (letters.c1valid ? letters.c1 + " is ok, " : letters.c1 + " isn't there I'm afraid.") +
                        (letters.c2valid ? " and " + letters.c2 + " is ok, " : " and " + letters.c2 + " isn't there I'm afraid.");
                    speech.say(phrase, "susie", function() {
                        if (isValid) score.me += word.length;
                        if (letters.c1valid) score.c1 += letters.c1.length;
                        round++;
                        playRound();
                    });
                });
            });
        }
    });
};

var checkNumber = function(number, callback) {
    callback(true);
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
        what: number,
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
            }
            if (mindiff === diff.c2 && numbers.c2method) {
                winners.push(c2first);
            }

            if (!isValid) {
                texts.push({
                    what: "Sorry, Richard, but you've gone wrong.",
                    who: "rachel"
                });
            }
            else {
                if (mindiff === diff.p) {
                    winners.push("richard");
                }
            }

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


    rows = r;
    name = player;
    c1 = $(rows[0]).find('.c1word').text();
    c2 = $(rows[0]).find('.c2word').text();
    var finalScores = $(rows[rows.length-1]).find('.score').text().split(/[^0-9]/).map(function(v){return +v;});
    var isChampWinner = finalScores[0]>finalScores[1];

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
        c1 = Math.random()>0.5 ? c1 : c2;
    }
    else if (vs === "both") {
        c2first = c2.split(' ')[0];
    }

    c1first = c1.split(' ')[0];
   
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
        $(elSlots[i]).text(l);
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
                        elNumber.val("").show().focus();
                    });
                });
            });
        });
    }
};

var playRound = function() {
    $('.page').hide();
    elSlots.text("");
    elWord.val("");

    var i = round;
    if (i === 4 || i === 11) {
        //Tea time teaser
        round++;
        playRound();
    }
    else if ([1, 2, 5, 6, 8, 9, 12, 13, 14, 15].indexOf(i) > -1) {
        //letters
        
        $('#letters-page').show();

        letters = getLetters($(rows[i]));
        var cont = ([1, 2, 5, 6, 8, 9, 12, 13, 14, 15].indexOf(i) % 2 === 0 ? c1first : name);

        speech.say("Ok, " + cont + speech.LETTERS, "NICK", function() {
            doLetter(cont);
        });
    }
    else if (i === 17) {
        //con
        $('#conundrum-page').show();
        letters = getConundrum($(rows[i]));

        $('.conundrum-buzz').show();

        speech.say("So finally it's time for the conundrum.  Fingers on buzzers as we reveal, today's, countdown conundrum.", "nick", function() {
            doConundrum();
        });
    }
    else if ([3, 7, 10, 16].indexOf(i) > -1) {
        //numbers
        $('#numbers-page').show();
        var cont = ([3, 7, 10, 16].indexOf(i) % 2 === 0 ? c1first : name);
        numbers = getNumbers($(rows[i]));

        speech.say("Ok, " + cont + speech.NUMBERS, "NICK", function() {
            doNumber(cont);
        });
    };
}

var initialise = function(clock, slots, nslots, wordLengthDeclare, wordDeclare, numberDeclare) {
    elClock = clock;
    elSlots = slots;
    elNSlots = nslots;
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