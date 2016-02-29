var isValidWord = function(word, callback) {
    $.getJSON('check.php?word=' + word, function(data) {
        if (data.match) {
            callback(true);
        }
        else {
            callback(false);
        }
    });
};

module.exports = {
  isValidWord: isValidWord  
};