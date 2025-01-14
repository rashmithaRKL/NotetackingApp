<?php
header('Content-Type: application/json');
include 'db.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Get data from POST request
    $data = json_decode(file_get_contents("php://input"));
    $title = $data->title;
    $content = $data->content;
    $category = $data->category;
    $date = $data->date;

    try {
        $query = "INSERT INTO note (title, content, category, date) VALUES (?, ?, ?, ?)";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$title, $content, $category, $date]);
        echo json_encode(["success" => "Note added successfully"]);
    } catch (PDOException $e) {
        echo json_encode(["error" => $e->getMessage()]);
    }
}
?>