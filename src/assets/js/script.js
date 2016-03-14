//get data
var game = require('./game.js');

$(document).ready(function() {
    game.init($('.clock'), $('.slot'), $('.nslot'), $('.cslot'), $('.letter-declare'), $('.word-declare'), $('.number-declare'));
    $('#episode').keydown(function(e) {
        if (e.keyCode == 13) $('#go').click();
    });

    $('#go').on('click', function() {
        var vs = $('select[name=player]').val();
        var episode = $('#episode').val();
        episode = episode === "" ? Math.floor(Math.random()*5000) + 1000 : episode;
        
        /*
         LLNLLNLLNLLLLNC - 5666 -
         LLLLNLLLLNLLLNC - 3086 - 5665
         LLLNLLLNC       - 1    - 3086
         LLNLLNCLLNLLNC  - 14 round (grand finals / CoCs / 2 specials) [80,132,184,234,288,338,397,404,444,445,494,544,594,601,644,707,757,812,819,867,937,1002,1003,1067,1074,1132,1197,1262,1327,1334,1392,1457,1522,1523,1587,1594,1652,1717,1782,1847,1854,1907,1972,2037,2102,2162,2177,2292,2422,2552,2673,2678,2797,2911,3042,3085]
        */
        
        $.get('down.php?episode=' + episode, function(doc) {
            $('#intro-page').hide();
            game.start($(doc).find('.round_table').children(), vs, "richard");
        });
    });

    $('#goWord').on('click', function() {
        game.declare.word($('#word').val().toUpperCase());
    });


    $('#word').keydown(function(e) {
        if (e.keyCode == 13) $('#goWord').click();
    });

    $('#goNumber').on('click', function() {
        game.declare.number($('#number').val());
    });

    $('#goNumberNothing').on('click', function() {
        game.declare.number('');
    });


    $('#number').keydown(function(e) {
        if (e.keyCode == 13) $('#goNumber').click();
    });

    $('.letter-declare').on('click', 'span', function(e) {
        game.declare.wordLength($(this).text());
    });
    
    $('#buzz').on('click', function(){
        $('.conundrum-buzz').hide();
        $('.conundrum-declare').show();
    });
    
    $('#goConundrum').on('click', function(){
        
    });
});
