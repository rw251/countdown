<?php
$host=getenv('CDOWN_MYSQL_HOST');
$username=getenv('CDOWN_MYSQL_USER');
$password=getenv('CDOWN_MYSQL_PASS');
$database=getenv('CDOWN_MYSQL_DB');

// Create connection
$conn = new mysqli($host, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

function firstEpisodeWithData($conn) {
  $sql = "SELECT MIN(id) as minid FROM episodes";
  $result = $conn->query($sql);

  if ($result->num_rows > 0) {
      $row = $result->fetch_assoc();
      return $row["minid"];
  } else {
      return -1;
  }
}

function lastEpisodeWithData($conn) {
  $sql = "SELECT MAX(id) as maxid FROM episodes";
  $result = $conn->query($sql);

  if ($result->num_rows > 0) {
      $row = $result->fetch_assoc();
      return $row["maxid"];
  } else {
      return -1;
  }
}

function episodesWithData($conn) {
  $sql = "SELECT id FROM episodes ORDER BY id";
  $result = $conn->query($sql);

  if ($result->num_rows > 0) {
      while($row = $result->fetch_assoc()) {
        $rows[] = $row["id"];
      }
  } else {
      $rows = array();
  }
  return $rows;
}

function episodesWithoutData($conn) {
  $with = episodesWithData($conn);

  $i=1;

  foreach($with as $id) {
    while($i<$id){
      $ids[] = $i;
      $i++;
    }
    $i++;
  }
  
  return $ids;
}


switch($_GET["m"]) {
  case "episodesWithData":
    $json = episodesWithData($conn);
    break;
  case "episodesWithoutData":
    $json = episodesWithoutData($conn);
    break;
  case "firstEpisodeWithData":
    $json = firstEpisodeWithData($conn);
    break;
  case "lastEpisodeWithData":
    $json = lastEpisodeWithData($conn);
    break;
  default:
    $json = "Please perform request with a valid method parameter: ?m=episodesWithData";
}


$jsonstring = json_encode($json);
echo $jsonstring;


$conn->close();
die();
?>
