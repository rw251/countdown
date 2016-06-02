<?php

// Set your return content type
$word=!empty($_GET['word']) ? trim($_GET['word']) : "";
$rtn = array ('word'=>$word,'match'=>false);

if($word === "") {
    echo json_encode($rtn);
    exit;
}

// Website url to open
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

echo json_encode($rtn);
?>