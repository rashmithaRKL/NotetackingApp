<?php
header('Content-Type: application/json');
require_once 'db.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed. Please use POST.'
    ]);
    exit();
}

try {
    // Get and decode JSON data
    $json = file_get_contents('php://input');
    $data = json_decode($json);

    if (!$data) {
        throw new Exception('Invalid JSON data provided');
    }

    // Validate required fields
    $required_fields = ['title', 'content', 'category', 'date'];
    $validation_errors = validateFields($data, $required_fields);

    if (!empty($validation_errors)) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Validation failed',
            'errors' => $validation_errors
        ]);
        exit();
    }

    // Sanitize inputs
    $title = filter_var($data->title, FILTER_SANITIZE_STRING);
    $content = filter_var($data->content, FILTER_SANITIZE_STRING);
    $category = filter_var($data->category, FILTER_SANITIZE_STRING);
    $date = filter_var($data->date, FILTER_SANITIZE_STRING);

    // Validate date format
    $date_obj = DateTime::createFromFormat('Y-m-d', $date);
    if (!$date_obj || $date_obj->format('Y-m-d') !== $date) {
        throw new Exception('Invalid date format. Please use YYYY-MM-DD');
    }

    // Insert note into database
    $query = "INSERT INTO note (title, content, category, date) VALUES (?, ?, ?, ?)";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$title, $content, $category, $date]);

    // Get the ID of the newly inserted note
    $noteId = $pdo->lastInsertId();

    // Return success response with the new note data
    http_response_code(201);
    echo json_encode([
        'status' => 'success',
        'message' => 'Note created successfully',
        'data' => [
            'id' => $noteId,
            'title' => $title,
            'content' => $content,
            'category' => $category,
            'date' => $date
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo handleError('Database error occurred', $e);
} catch (Exception $e) {
    http_response_code(400);
    echo handleError($e->getMessage());
}
?>