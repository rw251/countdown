/* jshint node: true */
/* global location */

var speech = require("./speech"),
    numberRound = require('./numbers'),
    letterRound = require('./letters'),
    conundrumRound = require('./conundrum'),
    timer = require('./timer'),
    score = require('./score'),
    local = require('./local'),
    $ = require('jquery');

var tmpl = {
    letters: require("templates/letters"),
    numbers: require("templates/numbers"),
    conundrum: require("templates/conundrum"),
    score: require("templates/score"),
    feed: require("templates/feed"),
    welcome: require("templates/welcome")
};

var c1, c2, rows, name, round = 0,
    letters,
    switcheroo = false,
    skipLetters = true,
    skipNumbers = false,
    skipConundrums = false;

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
    var finalScores = $(rows[rows.length - 1]).find('.score').text().split(/[^0-9]/).filter(function(v) {
        return v !== "";
    }).map(function(v) {
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
        score.c2first = c2.split(' ')[0];
        $('#c2').text(score.c2first + ": ");
    }
    if (c1 === c2) switcheroo = true;

    score.c1first = c1.split(' ')[0];

    $('#p1').text(name + ": ");
    $('#c1').text(score.c1first + ": ");

    speech.say([{
        what: speech.WELCOME,
        who: "nick"
    }, {
        what: speech.WHO + player + " and " + c1 + (score.c2first ? " and " + c2 + "." : "."),
        who: "nick"
    }], function() {
        playRound();
    });
};

var playRound = function() {
    var cont;

    round++;
    timer.reset();
    //$('.page').hide();
    //$('#clock-score').show();
    //$('.letter-board .tileInner').html("");
    //$('.number-board .tileInner').html("");
    //$('.nslot').html("&nbsp;");

    score.update();

    //$('#test').html(rows[round]);

    if ($(rows[round]).find('.lselection').length > 0 && !skipLetters) {
        //letters
        $('#container').html(tmpl.letters());

        letters = letterRound.load($(rows[round]), switcheroo);
        cont = ([1, 2, 5, 6, 8, 9, 12, 13, 14, 15].indexOf(round) % 2 === 0 ? score.c1first : name);

        speech.say("Ok, " + cont + speech.LETTERS, "NICK", function() {
            letterRound.do(cont);
        });
    }
    else if ($(rows[round]).find('.nselection').length > 0 && !skipNumbers) {
        //numbers
        cont = ([3, 7, 10, 16].indexOf(round) % 2 === 0 ? score.c1first : name);
        numberRound.load($(rows[round]), switcheroo);

        $('#container').html(tmpl.numbers({
            target: +numberRound.getTarget()
        }));

        speech.say("Ok, " + cont + speech.NUMBERS, "NICK", function() {
            numberRound.do(cont);
        });
    }
    else if ($(rows[round]).find('.cselection').length > 0 && !skipConundrums) {
        //con
        conundrumRound.load($(rows[round]), switcheroo);

        $('#container').html(tmpl.conundrum());

        speech.say("So finally it's time for the conundrum.  Fingers on buzzers as we reveal, today's, countdown conundrum.", "nick", function() {
            conundrumRound.do(score.c1first);
        });
    }
    else {
        //Tea time teaser
        playRound();
    }
};

var initialise = function() {

    $('#container').html(tmpl.welcome(local.settings));
    score.me = 0;
    score.c1 = 0;
    score.c2 = 0;

    $('#episode').keydown(function(e) {
        if (e.keyCode == 13) $('#go').click();
    });

    $('#go').on('click', function(e) {
        timer.enableNoSleep();
        var vs = $('select[name=player]').val();
        var episode = $('#episode').val();
        episode = episode === "" ? Math.floor(Math.random() * 5000) + 1000 : episode;

        speech.silent = !$('#setting-speech').is(':checked');
        speech.speed = +$('[name=setting-speed]:checked').val();
        timer.LENGTH = +$('#setting-clock').val();
        timer.reset();
        skipLetters = !$('#setting-inc-letters').is(':checked');
        skipNumbers = !$('#setting-inc-numbers').is(':checked');
        skipConundrums = !$('#setting-inc-conundrum').is(':checked');

        /*
         LLNLLNLLNLLLLNC - 5666 -
         LLLLNLLLLNLLLNC - 3086 - 5665
         LLLNLLLNC       - 1    - 3086
         LLNLLNCLLNLLNC  - 14 round (grand finals / CoCs / 2 specials) [80,132,184,234,288,338,397,404,444,445,494,544,594,601,644,707,757,812,819,867,937,1002,1003,1067,1074,1132,1197,1262,1327,1334,1392,1457,1522,1523,1587,1594,1652,1717,1782,1847,1854,1907,1972,2037,2102,2162,2177,2292,2422,2552,2673,2678,2797,2911,3042,3085]
        */

        $.get('down.php?episode=' + episode, function(doc) {
            $('#feed').html(tmpl.feed());
            $('#score').html(tmpl.score());
            startGame($(doc).find('.round_table').children(), vs, "richard");
        });

        e.preventDefault();
    });

    $('#container').on('click', '#goWord', function() {
        timer.enableNoSleep();
        letterRound.declare($('#word').val().toUpperCase(), playRound);
    }).on('click', '#undoLetter', function() {
        letterRound.undo();
    }).on('click', '#goNumber', function() {
        timer.enableNoSleep();
        numberRound.declare($('#number').val(), playRound);
    }).on('click', '#goNumberNothing', function() {
        timer.enableNoSleep();
        numberRound.declare('', playRound);
    }).on('click', '.letter-declare .tileInner', function(e) {
        letterRound.declareWordLength($(this).text());
    }).on('keydown', '#word', function(e) {
        if (e.keyCode == 13) $('#goWord').click();
    }).on('keydown', '#number', function(e) {
        if (e.keyCode == 13) $('#goNumber').click();
    }).on('click', '#buzz', function() {
        $('.conundrum-buzz').hide();
        $('.conundrum-declare').show();
        conundrumRound.buzz();
    }).on('click', '#goConundrum', function() {
        conundrumRound.declare($('#conundrum').val());
    }).on('keydown', '#conundrum', function(e) {
        if (e.keyCode == 13) $('#goConundrum').click();
    });

    //Temp for trying out different interfaces
    var display = location.href.split("?").splice(1);
    if (display.length > 0) {
        var els = display[0].split("&");
        var tmp;
        switch (els[0][0]) {
            case "n":
                tmp = require("templates/numbers")({
                    target: 200
                });
                break;
            case "l":
                tmp = require("templates/letters")();
                break;
            default:
                tmp = require("templates/conundrum")();
        }
        $('#container').html(tmp);
        if (els.length > 1 && els[1][0] === "s") $('#container').find('*').show();

    }
};

module.exports = {
    init: initialise
};