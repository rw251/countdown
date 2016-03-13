var isValidWord = function(word, callback) {
    $.getJSON('check.php?word=' + word, function(data) {
        if (data.match) {
            callback(true);
        }
        else {
            callback(false);
        }
    }).done(function() {
        console.log("second success");
    })
    .fail(function() {
        console.log("error");
    })
    .always(function() {
        console.log("complete");
    });
};

module.exports = {
    isValidWord: isValidWord
};