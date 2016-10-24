<?php

// Set your return content type
$word=!empty($_GET['word']) ? trim($_GET['word']) : "";
$rtn2 = array ('word'=>$word,'match'=>false);

if($word === "") {
    $rtn2['noword']=true;
    echo json_encode($rtn2);
    exit;
}

$host = "https://od-api.oxforddictionaries.com:443/api/v1/inflections/en/" . $word;

$ch = curl_init();

// endpoint url
curl_setopt($ch, CURLOPT_URL, $host);

// set header
//932aa66b
curl_setopt($ch, CURLOPT_HTTPHEADER, array('app_id: ' . getenv('OED_ID'), 'app_key: ' . getenv('OED_KEY')));

// return transfer as string
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

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

// Website url to open
/*
$url = "https://www.oxforddictionaries.com/search/?direct=1&multi=1&dictCode=english&q=$word";


libxml_use_internal_errors(true);

$doc = new DOMDocument();
$doc->loadHTMLFile($url);

$xpath = new DOMXpath($doc);
$elements = $xpath->query("//title");

if (!is_null($elements)) {
    $title = $elements->item(0)->childNodes->item(0)->nodeValue;
    if(strpos($title,"alternative") === false) {
        $rtn['match'] = true;
    }
} else {
}

echo json_encode($rtn);*/
?>