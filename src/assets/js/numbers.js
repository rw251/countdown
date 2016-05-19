var speech = require('./speech.js'),
    timer = require('./timer.js'),
    score = require('./score.js');

var numbers;

var numberRound = {

    load: function(val, switcheroo) {
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

        numbers = rtn;
    },

    do: function(contestant) {
        if (numbers.selection.length === 6) {
            var number = numbers.selection.pop();
            speech.say("Hi Rachel, can I have " + numbers.say + " please.", contestant, function() {
                $('.nslot')[5].innerText = number;
                speech.say(number, "Rachel", function() {
                    numberRound.do(contestant);
                });
            });
        }

        else if (numbers.selection.length > 0) {
            var number = numbers.selection.pop();
            $('.nslot')[numbers.selection.length].innerText = number;
            speech.say(number, "Rachel", function() {
                numberRound.do(contestant);
            });
        }
        else {
            speech.say("And the target is...", "rachel", function() {
                $('.target').text(numbers.target);
                speech.say(numbers.target, "rachel", function() {
                    speech.say(speech.THIRTY, "nick", function() {
                        timer.start(function() {
                            speech.say("Time's up. So what do you have?", "nick");
                             $('.number-declare').show().find('input[type=text]').val("").focus();
                        });
                    });
                });
            });
        }
    },

    declare: function(number, playRound) {
         $('.number-declare').hide();

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
            who: score.c1first
        });
        if (score.c2first) texts.push({
            what: numbers.c2method ? numbers.c2 : "Sorry, I messed up",
            who: score.c2first
        });

        speech.say(texts, function() {
            numberRound.checkNumber(number, function(isValid) {
                texts = [];
                var mindiff = score.c2first ? Math.min(diff.c1, diff.c2) : diff.c1;
                if (isValid) mindiff = Math.min(mindiff, diff.p);
                var winners = [];
                if (mindiff === diff.c1 && numbers.c1method) {
                    winners.push(score.c1first);
                    score.c1 += c1points;
                }
                if (score.c2first && mindiff === diff.c2 && numbers.c2method) {
                    score.c2 += c2points;
                    winners.push(score.c2first);
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
                        playRound();
                    });
                }
                else if (winners.length === 1) {
                    speech.say("Well done " + winners[0], "nick", function() {
                        playRound();
                    });
                }
                else if (winners.length === 2 && score.c2first) {
                    speech.say("Well done " + winners.join(" and "), "nick", function() {
                        playRound();
                    });
                }
                else {
                    speech.say("Well done everyone.", "nick", function() {
                        playRound();
                    });
                }
            });
        });
    },

    checkNumber: function(number, callback) {
        if (number === 0) return callback(false);
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


    }

};

module.exports = numberRound;