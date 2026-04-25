<?php
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

$input = json_decode(file_get_contents('php://input'), true);
$action = isset($input['action']) ? $input['action'] : '';

if ($action === 'register') {
    $nume = $input['nume'];
    $email = $input['email'];
    $telefon = $input['telefon'];
    $parola = $input['parola'];

    $stmt = $conn->prepare("SELECT id FROM utilizatori WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        echo json_encode(["ok" => false, "mesaj" => "Există deja un cont cu acest email."]);
    } else {
        $stmt->close();
        $stmt = $conn->prepare("INSERT INTO utilizatori (nume, email, telefon, parola) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $nume, $email, $telefon, $parola);
        
        if ($stmt->execute()) {
            $id = $stmt->insert_id;
            echo json_encode([
                "ok" => true,
                "user" => [
                    "id" => $id,
                    "nume" => $nume,
                    "email" => $email,
                    "telefon" => $telefon
                ]
            ]);
        } else {
            echo json_encode(["ok" => false, "mesaj" => "Eroare la crearea contului."]);
        }
    }
    $stmt->close();
} elseif ($action === 'login') {
    $email = $input['email'];
    $parola = $input['parola'];

    $stmt = $conn->prepare("SELECT id, nume, email, telefon FROM utilizatori WHERE email = ? AND parola = ?");
    $stmt->bind_param("ss", $email, $parola);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        echo json_encode([
            "ok" => true,
            "user" => $user
        ]);
    } else {
        echo json_encode(["ok" => false, "mesaj" => "Email sau parolă incorectă."]);
    }
    $stmt->close();
} else {
    echo json_encode(["ok" => false, "mesaj" => "Acțiune invalidă."]);
}

$conn->close();
?>
