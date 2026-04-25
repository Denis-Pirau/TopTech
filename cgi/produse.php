<?php
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

$sql = "SELECT * FROM produse";
$result = $conn->query($sql);

$produse = array();

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $row['specificatii'] = json_decode($row['specificatii'], true);
        $row['id'] = (int)$row['id'];
        $row['pretCurent'] = (float)$row['pretCurent'];
        if ($row['pretVechi'] !== null) {
            $row['pretVechi'] = (float)$row['pretVechi'];
        }
        $produse[] = $row;
    }
}

echo json_encode($produse);
$conn->close();
?>
