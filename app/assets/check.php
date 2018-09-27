<?php
// Check if a word is allowed
// E.g. to check the word 'permission'
// CALL     check.php?word=permission
// RETURNS  {"word":"permission", "match": true}
// TYPE     JSON
// If no word sent returns {"noword": true}

// Get the word to check
$word=!empty($_GET['word']) ? trim($_GET['word']) : "";

// Declare return object
$rtn2 = array ('word'=>$word,'match'=>false);

// No word so return nothing
if($word === "") {
    $rtn2['noword']=true;
    echo json_encode($rtn2);
    exit;
}

// Words that aren't hyphenated in en.oxford.. but are in the v1/inflections method call
$exceptions = array("exactor", "stargaze", "exactors", "stargazes", "stargazer", "stargazed", "crudites","nodalise","nodalises","nodalised","manless"); 
//told them about exactor - not yet about stargaze

// Return true if in the exception list
if(in_array(strtolower($word), $exceptions)) {
    $rtn2['match']=true;
    echo json_encode($rtn2);
    exit;
}

$host = "https://od-api.oxforddictionaries.com:443/api/v1/inflections/en/" . $word;

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $host);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('app_id: ' . getenv('OED_ID'), 'app_key: ' . getenv('OED_KEY')));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
// enable thie following for debugging
// curl_setopt($ch, CURLOPT_VERBOSE, true);

$rtn = json_decode(curl_exec($ch));
curl_close($ch);
$valid=false;
if($rtn != null && array_key_exists("results",$rtn)) {
    foreach($rtn->results as $result) {
        foreach($result->lexicalEntries as $lexes) {
            foreach($lexes->inflectionOf as $inf) {
                if(ctype_lower($inf->text)) $rtn2['match']=true;
            }
        }
    }
}

echo json_encode($rtn2);

?>
