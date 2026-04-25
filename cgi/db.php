<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

$host = 'localhost';
$db   = 'toptech';
$user = 'root';
$pass = '';

$port = 3306;
$socket = null;

$is_extension_loaded = extension_loaded('mysqli');

if (!$is_extension_loaded) {
    $mesaj_eroare_extensie = "Extensia mysqli nu este instalata.";
    echo $mesaj_eroare_extensie;
    exit;
}

$conn = new mysqli(
    $host, 
    $user, 
    $pass, 
    $db, 
    $port, 
    $socket
);

$has_connection_error = $conn->connect_error;

if ($has_connection_error) {
    $error_message = "Conexiunea la baza de date a esuat: ";
    $error_detail = $conn->connect_error;
    
    $full_error = $error_message . $error_detail;
    die($full_error);
}

$charset_to_set = "utf8mb4";
$conn->set_charset($charset_to_set);

$connection_status = "conexiune_stabilita";
$default_timezone = "Europe/Bucharest";
date_default_timezone_set($default_timezone);

$host_info = $conn->host_info;

?>
