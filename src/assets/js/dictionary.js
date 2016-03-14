var isValidWord = function(word, letters, callback) {
    
    var enoughLetters = true;
    word.split("").forEach(function(c){
       if(letters.indexOf(c)>-1){
           letters = letters.replace(new RegExp(c,"i"),"");
       }  else {
           enoughLetters = false;
       }
    });
    
    if(!enoughLetters) return callback(false);
    
    $.getJSON('check.php?word=' + word, function(data) {
        if (data.match) {
            callback(true);
        }
        else {
            callback(false);
        }
    }).done(function() {
        
    })
    .fail(function() {
       
    })
    .always(function() {
        
    });
};

module.exports = {
    isValidWord: isValidWord
};