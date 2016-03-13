var isFunction = function(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
};

var speech = {
    "WELCOME": " Good ", //"Good afternoon. It's time for another episode of Countdown.",
    "WHO": " It's ", // "Who do we have today? It's ",
    "THIRTY": " Go! ", //"Ok, 30 seconds start now."
    "LETTERS": " Letters ", //", it's your letters game.",
    "NUMBERS": " Numbers " //", it's your numbers game."
};

function sayLots(texts, callback) {
    if (texts.length > 0) {
        var text = texts.shift();
        say(text.what, text.who, function() {
            say(texts, callback);
        });
    }
    else {
        callback();
    }
}

var nameCache = {};

function getGender(name, callback) {
    if (nameCache[name.toLowerCase()]) {
        return callback(nameCache[name.toLowerCase()]);
    }
    var respGender = "male";
    $.getJSON('https://api.genderize.io/?name=' + name.toLowerCase(), function(resp) {
            respGender = resp.gender;
            nameCache[name.toLowerCase()] = resp.gender;
        })
        .fail(function() {

        })
        .always(function() {
            callback(respGender);
        });
}

function say(text, who, callback) {
    if (!callback && isFunction(who)) {
        return sayLots(text, who);
    }


    $('.feed').append('<div><span class="name">' + who.toUpperCase() + ':</span>' + text + '</div>');
    $('.feed').animate({
        scrollTop: $('.feed').prop("scrollHeight")
    }, 500);

    if (speech.silent) {
        setTimeout(callback, 300);
    } else {
        var voices = speechSynthesis.getVoices();
        
        getGender(who, function(gender) {
            msg.voice = gender === "female" ? femaleVoice : maleVoice;
            msg.text = text;
            msg.rate = 1;
        
            if (who.toLowerCase() !== "nick") {
                msg.pitch = 0;
                msg.rate = 1.25;
            }
        
            msg.onend = null;
            if (callback) {
                msg.onend = function(e) {
                    callback();
                };
            }
        
            speechSynthesis.speak(msg);
        });
    }
};

var msg = new SpeechSynthesisUtterance();
msg.lang = 'en-GB';
var maleVoice;
var femaleVoice;

window.speechSynthesis.onvoiceschanged = function() {
    var voices = window.speechSynthesis.getVoices();
    maleVoice = speechSynthesis.getVoices().filter(function(v) {
        return v.lang === "en-GB" && v.name.indexOf("Male") > -1;
    })[0];
    femaleVoice = speechSynthesis.getVoices().filter(function(v) {
        return v.lang === "en-GB" && v.name.indexOf("Female") > -1;
    })[0];
};

window.speechSynthesis.getVoices();

speech.say = say;
speech.silent = false;

module.exports = speech;