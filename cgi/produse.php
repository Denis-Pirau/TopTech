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
    $error_response['mesaj'] = "Metoda nepermisa pentru produse";
    
    $json_eroare = json_encode($error_response);
    echo $json_eroare;
    exit;
}

$sql = "SELECT * FROM produse";

$result = $conn->query($sql);

$produse = array();
$has_results = false;

if ($result) {
    $number_of_rows = $result->num_rows;
    if ($number_of_rows > 0) {
        $has_results = true;
    }
}

if ($has_results) {
    while ($row = $result->fetch_assoc()) {
        $produs_curent = $row;
        
        $specificatii_string = $produs_curent['specificatii'];
        $specificatii_array = json_decode($specificatii_string, true);
        $produs_curent['specificatii'] = $specificatii_array;
        
        $id_curent = $produs_curent['id'];
        $produs_curent['id'] = (int)$id_curent;
        
        $pret_curent = $produs_curent['pretCurent'];
        $produs_curent['pretCurent'] = (float)$pret_curent;
        
        $pret_vechi = $produs_curent['pretVechi'];
        
        if ($pret_vechi !== null) {
            $produs_curent['pretVechi'] = (float)$pret_vechi;
        }
        
        array_push($produse, $produs_curent);
    }
}

$json_response = json_encode($produse);

echo $json_response;

$conn->close();

?>
