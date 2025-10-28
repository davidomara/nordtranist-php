<?php
$host = 'localhost';
$db = 'transport_management';
$user = 'root'; // change if needed
$pass = '';     // change if needed

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

$sql = "SELECT * FROM vehicle";
$result = $conn->query($sql);

$data = array();

while ($row = $result->fetch_assoc()) {
  $row['veh_available'] = $row['veh_available'] == 1 ? 'Available' : 'Unavailable';
  $data[] = $row;
}

echo json_encode(['data' => $data]);
?>
