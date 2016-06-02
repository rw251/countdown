<?php
// Set your return content type
header('Content-type: application/xml');
$episode=!empty($_GET['episode']) ? trim($_GET['episode']) : "2630";
if(!is_numeric($episode)) $episode = "2630";

// Website url to open
$url = "http://wiki.apterous.org/Episode_$episode";

// Get that website's content
$handle = fopen($url, "r");

// If there is something, read and return
if ($handle) {
    while (!feof($handle)) {
        $buffer = fgets($handle, 4096);
        echo $buffer;
    }
    fclose($handle);
}
?>