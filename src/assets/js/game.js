var speech = require("./speech.js"),
    numberRound = require('./numbers.js'),
    letterRound = require('./letters.js'),
    timer = require('./timer.js'),
    score = require('./score.js');

var c1, c2, rows, name, round = 0,
    letters,
    switcheroo = false,
    skipLetters = true,
    skipNumbers = false,
    skipConundrums = false;



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


var updateScore = function() {
    $('#pscore').text(score.me);
    $('#c1score').text(score.c1);
    if (score.c2first) $('#c2score').text(score.c2);
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
    var finalScores = $(rows[rows.length - 1]).find('.score').text().split(/[^0-9]/).filter(function(v){
        return v!=="";
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

var doConundrum = function() {
    letters.conundrum.split("").forEach(function(l, i) {
        $($('.cslot')[i]).text(l);
    });
    timer.start(function() {
        speech.say("Time's up.", "nick", function() {
            letters.answer.split("").forEach(function(l, i) {
                $($('.slot')[i]).text(l);
            });
        });
    });
};

var playRound = function() {
    round++;
    $('.page').hide();
    $('.slot').html("&nbsp;");
    $('.nslot').html("&nbsp;");

    updateScore();

    $('#test').html(rows[round]);

    if ($(rows[round]).find('.lselection').length > 0 && !skipLetters) {
        //letters
        $('#letters-page').show();

        letters = letterRound.load($(rows[round]), switcheroo);
        var cont = ([1, 2, 5, 6, 8, 9, 12, 13, 14, 15].indexOf(round) % 2 === 0 ? score.c1first : name);

        speech.say("Ok, " + cont + speech.LETTERS, "NICK", function() {
            letterRound.do(cont);
        });
    }
    else if ($(rows[round]).find('.nselection').length > 0 && !skipNumbers) {
        //numbers
        $('.target').text("000");
        $('#numbers-page').show();
        var cont = ([3, 7, 10, 16].indexOf(round) % 2 === 0 ? score.c1first : name);
        numberRound.load($(rows[round]), switcheroo);

        speech.say("Ok, " + cont + speech.NUMBERS, "NICK", function() {
            numberRound.do(cont);
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
        playRound();
    }
}

var initialise = function() {
    score.me = 0;
    score.c1 = 0;
    score.c2 = 0;
    
    $('#episode').keydown(function(e) {
        if (e.keyCode == 13) $('#go').click();
    });

    $('#go').on('click', function() {
        var vs = $('select[name=player]').val();
        var episode = $('#episode').val();
        episode = episode === "" ? Math.floor(Math.random()*5000) + 1000 : episode;
        
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
            $('#intro-page').hide();
            startGame($(doc).find('.round_table').children(), vs, "richard");
        });
    });

    $('#goWord').on('click', function() {
        letterRound.declare($('#word').val().toUpperCase(), playRound);
    });


    $('#word').keydown(function(e) {
        if (e.keyCode == 13) $('#goWord').click();
    });

    $('#goNumber').on('click', function() {
        numberRound.declare($('#number').val(), playRound);
    });

    $('#goNumberNothing').on('click', function() {
        numberRound.declare('', playRound);
    });


    $('#number').keydown(function(e) {
        if (e.keyCode == 13) $('#goNumber').click();
    });

    $('.letter-declare').on('click', 'span', function(e) {
        letterRound.declareWordLength($(this).text());
    });
    
    $('#buzz').on('click', function(){
        $('.conundrum-buzz').hide();
        $('.conundrum-declare').show();
    });
    
    $('#goConundrum').on('click', function(){
        
    });
};

module.exports = {
    init: initialise
};