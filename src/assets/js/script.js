//get data
var game = require('./game.js');

$(document).ready(function() {
    game.init($('.clock'), $('.slot'), $('.nslot'), $('.letter-declare'), $('.word-declare'), $('.number-declare'));
    $('#episode').keydown(function(e) {
        if (e.keyCode == 13) $('#go').click();
    });

    $('#go').on('click', function() {
        var vs = $('select[name=player]').val();
        var episode = $('#episode').val();
        episode = episode === "" ? Math.floor(Math.random()*5000) + 1000 : episode;
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
