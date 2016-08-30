var speech = require('./speech.js'),
    timer = require('./timer.js'),
    score = require('./score.js'),
    dictionary = require("./dictionary.js"),
    $ = require('jquery');

var conundrum, wordLength;

var playRound;

var conundrumRound = {

    load: function(val, switcheroo, play) {
        playRound = play;
        var rtn = {
            c1: {},
            c2: {}
        };

        rtn.conundrum = val.find('.cselection').text();
        if (rtn.conundrum.length === 10) {
            //occasioinally conundrum is abcdefghi* if they don't know what it actually was
            rtn.conundrum = rtn.conundrum.substr(0, 9).toUpperCase();
        }
        var c1buzz = val.find('.c1buzz').text().trim();
        var c2buzz = val.find('.c2buzz').text().trim();
        var ans = val.find('.cothers').text().trim();

        if (c1buzz.length > 8 && c1buzz.indexOf('☓') === -1) ans = c1buzz;
        else if (c2buzz.length > 8 && c2buzz.indexOf('☓') === -1) ans = c2buzz;
        rtn.answer = ans.match(/[A-Z]{9}/)[0];

        rtn.c1.time = 60;
        rtn.c2.time = 60;

        //cultivater ☓ 
        //(7.5 seconds)

        //LUCRATIVE 
        //(16.75 seconds)

        //hustleing ☓ 
        //(25.25 seconds)

        //☓ 
        //(25.33 seconds)

        // empty if nothing
        rtn.c1.success = false;
        rtn.c2.success = false;

        if (c1buzz.length > 8) {
            console.log(c1buzz);
            console.log(c1buzz.match(/\(([0-9\.]+) /));
            rtn.c1.time = +c1buzz.match(/\(([0-9\.]+) /)[1];
            if (c1buzz.indexOf('☓') === -1) {
                rtn.who = "c1";
                rtn.c1.success = true;
            }
            else {
                rtn.c1.answer = c1buzz.match(/[A-Za-z]*/)[0].toUpperCase();
            }
        }
        if (c2buzz.length > 8) {
            console.log(c2buzz);
            console.log(c2buzz.match(/\(([0-9\.]+) /));
            rtn.c2.time = +c2buzz.match(/\(([0-9\.]+) /)[1];
            if (c2buzz.indexOf('☓') === -1) {
                rtn.who = "c2";
                rtn.c2.success = true;
            }
            else {
                rtn.c2.answer = c2buzz.match(/[A-Za-z]*/)[0].toUpperCase();
            }
        }

        if (switcheroo) {
            rtn.c3 = rtn.c1;
            rtn.c1 = rtn.c2;
            rtn.c2 = rtn.c3;
        }

        console.log(rtn);

        conundrum = rtn;
    },

    do: function(contestant) {
        conundrum.conundrum.split("").forEach(function(l, i) {
            $('.tileInner')[i].innerText = l;
        });
        if (conundrum.c1.time <= 30) {
            timer.conundrum(conundrum.c1.time, function() {
                speech.say(contestant + "?", "nick", function() {
                    speech.say("BUZZ!! Is it " + (conundrum.c1.answer || conundrum.answer), contestant, function() {
                        speech.say("Let's see...", "nick", function() {
                            if (conundrum.c1.success) {
                                conundrum.answer.split("").forEach(function(l, i) {
                                    $($('.tileInner')[i]).text(l);
                                });

                                score.c1 += 10;
                                score.update();
                                speech.say("Well done " + contestant, "nick", function() {
                                    playRound({
                                        time: [-1, conundrum.c1.time, conundrum.c2.time]
                                    }, true);
                                });
                            }
                            else {
                                "INCORRECT".split("").forEach(function(l, i) {
                                    $($('.tileInner')[i]).text(l);
                                });
                                speech.say("No that's incorrect. Ok Richard, the rest of the time is yours", "nick", function() {
                                    conundrum.conundrum.split("").forEach(function(l, i) {
                                        $('.tileInner')[i].innerText = l;
                                    });
                                    timer.conundrum(null, function() {
                                        speech.say("So no one got it...", "nick", function() {
                                            conundrum.answer.split("").forEach(function(l, i) {
                                                $($('.tileInner')[i]).text(l);
                                            });
                                            speech.say(conundrum.answer + ". Good game everyone", "nick", function() {
                                                playRound({
                                                    time: [-1, -1, conundrum.c2.time]
                                                }, true);
                                            });
                                        });
                                    });
                                });
                            }
                        });
                    });
                });
            });
        }
        else {
            timer.start(function() {
                speech.say("So no one got it...", "nick", function() {
                    conundrum.answer.split("").forEach(function(l, i) {
                        $($('.tileInner')[i]).text(l);
                    });
                    speech.say(conundrum.answer + ". Good game everyone", "nick", function() {
                        playRound({
                            time: [-1, -1, conundrum.c2.time]
                        }, true);
                    });
                });
            });
        }
    },

    declare: function(word) {
        $('body').off('keydown');
        $('.tileInner').removeClass('slot-hover').off('click').parent().removeClass('slot-done');
        speech.say("Is it " + word, "richard", function() {
            speech.say("Let's see..", "nick", function() {
                if (word.toLowerCase() === conundrum.answer.toLowerCase()) {
                    conundrum.answer.split("").forEach(function(l, i) {
                        $($('.tileInner')[i]).text(l);
                    });
                    score.me += 10;
                    score.update();
                    speech.say(conundrum.answer + ". Well done. Good game everyone", "nick", function() {
                        playRound({
                            time: [timer.getTime(), conundrum.c1.time, conundrum.c2.time]
                        }, true);
                    });
                }
                else {
                    "INCORRECT".split("").forEach(function(l, i) {
                        $($('.tileInner')[i]).text(l);
                    });
                    speech.say("No that's wrong. Rest of the time for you, " + score.c1first, "nick", function() {
                        conundrum.conundrum.split("").forEach(function(l, i) {
                            $($('.tileInner')[i]).text(l);
                        });
                        if (conundrum.c1.time <= 30) {
                            timer.conundrum(conundrum.c1.time, function() {
                                speech.say(score.c1first + "?", "nick", function() {
                                    speech.say("BUZZ!! Is it " + (conundrum.c1.answer || conundrum.answer), score.c1first, function() {
                                        speech.say("Let's see...", "nick", function() {
                                            if (conundrum.c1.success) {
                                                conundrum.answer.split("").forEach(function(l, i) {
                                                    $($('.tileInner')[i]).text(l);
                                                });
                                                score.c1 += 10;
                                                score.update();
                                                speech.say("Well done " + score.c1first, "nick", function() {
                                                    playRound({
                                                        time: [-1, conundrum.c1.time, conundrum.c2.time]
                                                    }, true);
                                                });
                                            }
                                            else {
                                                "INCORRECT".split("").forEach(function(l, i) {
                                                    $($('.tileInner')[i]).text(l);
                                                });
                                                speech.say("So no one got it...", "nick", function() {
                                                    conundrum.answer.split("").forEach(function(l, i) {
                                                        $($('.tileInner')[i]).text(l);
                                                    });
                                                    speech.say(conundrum.answer + ". Good game everyone", "nick", function() {
                                                        playRound({
                                                            time: [-1, -1, conundrum.c2.time]
                                                        }, true);
                                                    });
                                                });
                                            }
                                        });
                                    });
                                });
                            });
                        }
                    });
                }
            });
        });

    },

    buzz: function() {
        timer.isPaused = true;
        
        $('.tileInner').on('click', conundrumRound.doTile).addClass('slot-hover');
        
        $('body').on('keydown', function(e) {
            var k = e.keyCode;
            if (k > 90) k -= 32;
            if (k >= 65 && k <= 90) {
                conundrumRound.doTile.call($('.tile3:not(.slot-done) .tileInner:contains(' + String.fromCharCode(k) + '):first'));
                e.preventDefault();
            }
            else if (e.keyCode === 8) {
                conundrumRound.undo();
                e.preventDefault();
            }
            else if (e.keyCode === 13) {
                $('#goConundrum').click();
                e.preventDefault();
            }
           // e.preventDefault();

        });
    },
    
    doTile: function() {
        var t = $(this).text();
        $(this).parent().addClass('slot-done');
        $(this).off('click');
        $('.conundrum-declare').find('input[type=text]').val($('.conundrum-declare').find('input[type=text]').val() + t).focus();
        $('#conundrumalt').val($('#conundrum').val());
        if (!conundrumRound.tiles) conundrumRound.tiles = [$(this)];
        else conundrumRound.tiles.push($(this));
    },

    undo: function() {
        if (conundrumRound.tiles && conundrumRound.tiles.length > 0) {
            var tile = conundrumRound.tiles.pop();
            tile.parent().removeClass('slot-done');
            var newText = $('#conundrum').val().substr(0, $('#conundrum').val().length - 1);
            $('#conundrum').val(newText).focus();
            $('#conundrumalt').val(newText);
            tile.on('click', function() {
                var t = $(this).text();
                $(this).parent().addClass('slot-done');
                $(this).off('click');
                $('.conundrum-declare').find('input[type=text]').val($('.conundrum-declare').find('input[type=text]').val() + t).focus();
                $('#conundrumalt').val($('#conundrum').val());
                if (!conundrumRound.tiles) conundrumRound.tiles = [$(this)];
                else conundrumRound.tiles.push($(this));
            });
        }
    }

};

module.exports = conundrumRound;