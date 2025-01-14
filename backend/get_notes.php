<?php
header('Content-Type: application/json');
include 'db.php';

try {
    $query = "SELECT * FROM note";
    $stmt = $pdo->query($query);
    $notes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($notes);
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>