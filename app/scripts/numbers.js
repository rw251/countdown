var speech = require('./speech.js'),
    timer = require('./timer.js'),
    score = require('./score.js'),
    $ = require('jquery');

var numbers;

var numberRound = {

    load: function(val, switcheroo) {
        var rtn = {};

        rtn.selection = val.n;
        rtn.selectionClone = val.n.slice();

        rtn.small = 0;
        rtn.large = 0;

        rtn.selection.forEach(function(n) {
            if (n > 10) rtn.large++;
            else rtn.small++;
        });

        rtn.say = rtn.large === 0 ? "6 small numbers" : rtn.large + " large number" + (rtn.large === 1 ? "" : "s") + " and " + rtn.small + " small ones";

        rtn.target = val.t;
        rtn.c1 = val["1"];
        rtn.c2 = val["2"];
        if (val["1-bad"]) {
            rtn.c1valid = false;
        }
        else {
            rtn.c1method = val["1-sol"];
        }
        if (val["2-bad"]) {
            rtn.c2valid = false;
        }
        else {
            rtn.c2method = val["2-sol"];
        }

        rtn.rachel = val.sol;

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

    getTarget: function() {
        return numbers.target;
    },

    do: function(contestant) {
        var number;
        if (numbers.selection.length === 6) {
            number = numbers.selection.pop();
            speech.say("Hi Rachel, can I have " + numbers.say + " please.", contestant, function() {
                $($('.number-board .tileInner')[5]).removeClass("digits2 digits3 digits4");
                if (number > 9) $($('.number-board .tileInner')[5]).addClass("digits2");
                if (number > 99) $($('.number-board .tileInner')[5]).addClass("digits3");
                $('.number-board .tileInner')[5].innerText = number;
                speech.say(number, "Rachel", function() {
                    numberRound.do(contestant);
                });
            });
        }

        else if (numbers.selection.length > 0) {
            number = numbers.selection.pop();
            $($('.number-board .tileInner')[numbers.selection.length]).removeClass("digits2 digits3 digits4");
            if (number > 9) $($('.number-board .tileInner')[numbers.selection.length]).addClass("digits2");
            if (number > 99) $($('.number-board .tileInner')[numbers.selection.length]).addClass("digits3");
            $('.number-board .tileInner')[numbers.selection.length].innerText = number;
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

            var mindiff = score.c2first ? Math.min(diff.c1, diff.c2) : diff.c1;
            var method, winners = [];

            if (mindiff < diff.p || number === 0) {
                //you lost - so don't bother
                if (mindiff === diff.c1 && numbers.c1method) {
                    winners.push(score.c1first);
                    method = numbers.c1method;
                    score.c1 += c1points;
                }
                if (score.c2first && mindiff === diff.c2 && numbers.c2method) {
                    score.c2 += c2points;
                    method = numbers.c2method;
                    winners.push(score.c2first);
                }
                if (winners.length === 0) {
                    speech.say("So no-one got it. Never mind.", "nick", function() {
                        playRound({
                            numbers: numbers.selectionClone,
                            target: numbers.target,
                            what: [number, numbers.c1, numbers.c2],
                            valid: [null, !!numbers.c1method, !!numbers.c2method]
                        });
                    });
                }
                else if (winners.length === 1) {
                    speech.say("Go on " + winners[0], "nick", function() {
                        speech.say(method, winners[0], function() {
                            speech.say("Well done " + winners[0], "rachel", function() {
                                playRound({
                                    numbers: numbers.selectionClone,
                                    target: numbers.target,
                                    what: [number, numbers.c1, numbers.c2],
                                    valid: [null, !!numbers.c1method, !!numbers.c2method]
                                });
                            });
                        });
                    });
                }
                else if (winners.length === 2 && score.c2first) {
                    speech.say("Well done " + winners.join(" and "), "nick", function() {
                        playRound({
                            numbers: numbers.selectionClone,
                            target: numbers.target,
                            what: [number, numbers.c1, numbers.c2],
                            valid: [null, !!numbers.c1method, !!numbers.c2method]
                        });
                    });
                }
                return;
            }

            numberRound.checkNumber(number, function(isValid) {


                if (isValid) mindiff = Math.min(mindiff, diff.p);
                if (mindiff === diff.c1 && numbers.c1method) {
                    winners.push(score.c1first);
                    score.c1 += c1points;
                }
                if (score.c2first && mindiff === diff.c2 && numbers.c2method) {
                    score.c2 += c2points;
                    winners.push(score.c2first);
                }
                texts = [];
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
                        playRound({
                            numbers: numbers.selectionClone,
                            target: numbers.target,
                            what: [number, numbers.c1, numbers.c2],
                            valid: [isValid, !!numbers.c1method, !!numbers.c2method]
                        });
                    });
                }
                else if (winners.length === 1) {
                    speech.say("Well done " + winners[0], "nick", function() {
                        playRound({
                            numbers: numbers.selectionClone,
                            target: numbers.target,
                            what: [number, numbers.c1, numbers.c2],
                            valid: [isValid, !!numbers.c1method, !!numbers.c2method]
                        });
                    });
                }
                else if (winners.length === 2 && score.c2first) {
                    speech.say("Well done " + winners.join(" and "), "nick", function() {
                        playRound({
                            numbers: numbers.selectionClone,
                            target: numbers.target,
                            what: [number, numbers.c1, numbers.c2],
                            valid: [isValid, !!numbers.c1method, !!numbers.c2method]
                        });
                    });
                }
                else {
                    speech.say("Well done everyone.", "nick", function() {
                        playRound({
                            numbers: numbers.selectionClone,
                            target: numbers.target,
                            what: [number, numbers.c1, numbers.c2],
                            valid: [isValid, !!numbers.c1method, !!numbers.c2method]
                        });
                    });
                }
            });
        });
    },

    checkNumber: function(number, callback) {
        if (number === 0) return callback(false);
        $('#messedUp').on('click', function() {
            $('.number-board .tileInner').removeClass('slot-hover').parent().off('click').removeClass('slot-hide slot-selected slot-changed');
            $('.calcslot').removeClass('slot-hover').parent().off('click').removeClass('slot-hide slot-selected slot-changed');
            $('.number-calc').hide();
            $('#messedUp').off('click');
            callback(false);
        });

        $('.number-calc').show();

        var n1, n2, nn1, nn2, symbol, sum, n1inner, n2inner;

        var numclick = function() {
            if (symbol) {
                n1inner = n1.find('.tileInner');
                n2 = $(this);
                //$(this).addClass('slot-selected');
                $(this).parent().off('click');
                nn1 = +n1.text();
                nn2 = +n2.text();

                console.log(nn1, symbol.text(), nn2);

                if (symbol.find('.calcslot').data("operator") === "add") {
                    sum = nn1 + nn2;
                }
                else if (symbol.find('.calcslot').data("operator") === "times") {
                    sum = nn1 * nn2;
                }
                else if (symbol.find('.calcslot').data("operator") === "divide") {
                    sum = nn1 / nn2;
                }
                else {
                    sum = nn1 - nn2;
                }
                n1inner.removeClass("digits2 digits3 digits4");
                if (sum > 9) n1inner.addClass("digits2");
                if (sum > 99) n1inner.addClass("digits3");
                if (sum > 999) n1inner.addClass("digits4");
                n1inner.text(sum);

                n1.removeClass('slot-selected').addClass('slot-hover slot-changed').on('click', numclick);
                n2.removeClass('slot-selected').addClass('slot-hide');
                $('.calcslot').parent().removeClass('slot-selected').on('click', symclick).addClass('slot-hover');


                if (+n1.text() === number) {
                    $('.number-board .tileInner').removeClass('slot-hover').parent().off('click').removeClass('slot-hide slot-selected slot-changed');
                    $('.calcslot').removeClass('slot-hover').parent().off('click').removeClass('slot-hide slot-selected slot-changed');
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
            $('.calcslot').parent().off('click');
        };

        $('.number-board .tileInner').parent().on('click', numclick).addClass('slot-hover');
        $('.calcslot').parent().on('click', symclick).addClass('slot-hover');

        speech.say("Go on Richard, show us how it's done.", "nick", function() {

        });


    }

};

module.exports = numberRound;
