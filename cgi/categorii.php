<?php
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

$sql = "SELECT id, nume FROM categorii";
$result = $conn->query($sql);

$categorii = array();

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $categorii[] = $row;
    }
}

echo json_encode($categorii);
$conn->close();
?>
