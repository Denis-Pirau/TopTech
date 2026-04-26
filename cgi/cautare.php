<?php

require 'db.php';

$termen = isset($_GET['q']) ? $_GET['q'] : '';
$termen_curatat = $conn->real_escape_string($termen);

if (strlen($termen_curatat) > 0) {
    $sql = "SELECT id, nume, pretCurent, imagine FROM produse WHERE nume LIKE '%$termen_curatat%' LIMIT 5";
    $result = $conn->query($sql);
    
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $id = $row['id'];
            $nume = htmlspecialchars($row['nume']);
            $pret = $row['pretCurent'];
            
            echo "<div style='padding: 10px; border-bottom: 1px solid #eee; cursor: pointer;' onclick='window.location=\"html/produs.html?id=$id\"'>";
            echo "<strong>$nume</strong><br>";
            echo "<span style='color: #03dac6;'>$pret MDL</span>";
            echo "</div>";
        }
    } else {
        echo "<div style='padding: 10px; color: #cf6679;'>Nu s-au găsit produse.</div>";
    }
} else {
    echo "";
}

$conn->close();

?>
