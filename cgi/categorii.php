<?php

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: no-cache, must-revalidate');

require 'db.php';

$request_method = $_SERVER['REQUEST_METHOD'];
$este_metoda_get = ($request_method === 'GET');

if (!$este_metoda_get) {
    http_response_code(405);
    
    $error_response = array();
    $error_response['eroare'] = true;
    $error_response['mesaj'] = "Metoda nepermisa pentru categorii";
    
    $json_eroare = json_encode($error_response);
    echo $json_eroare;
    exit;
}

$sql = "SELECT id, nume FROM categorii";

$result = $conn->query($sql);

$categorii = array();
$has_results = false;

if ($result) {
    $number_of_rows = $result->num_rows;
    if ($number_of_rows > 0) {
        $has_results = true;
    }
}

if ($has_results) {
    while ($row = $result->fetch_assoc()) {
        $categorie_curenta = array();
        
        $categorie_curenta['id'] = $row['id'];
        $categorie_curenta['nume'] = $row['nume'];
        
        array_push($categorii, $categorie_curenta);
    }
}

$json_response = json_encode($categorii);

echo $json_response;

$conn->close();

?>
