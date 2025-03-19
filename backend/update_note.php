<?php
header('Content-Type: application/json');
require_once 'db.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed. Please use PUT or POST.'
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

    // Validate note ID
    if (!isset($data->id) || !is_numeric($data->id)) {
        throw new Exception('Valid note ID is required');
    }

    // Check if note exists
    $checkStmt = $pdo->prepare("SELECT id FROM note WHERE id = ?");
    $checkStmt->execute([$data->id]);
    if (!$checkStmt->fetch()) {
        http_response_code(404);
        echo json_encode([
            'status' => 'error',
            'message' => 'Note not found'
        ]);
        exit();
    }

    // Initialize update fields and parameters
    $updateFields = [];
    $params = [];

    // Check and validate each field
    if (isset($data->title) && !empty(trim($data->title))) {
        $updateFields[] = "title = ?";
        $params[] = filter_var($data->title, FILTER_SANITIZE_STRING);
    }

    if (isset($data->content) && !empty(trim($data->content))) {
        $updateFields[] = "content = ?";
        $params[] = filter_var($data->content, FILTER_SANITIZE_STRING);
    }

    if (isset($data->category) && !empty(trim($data->category))) {
        $updateFields[] = "category = ?";
        $params[] = filter_var($data->category, FILTER_SANITIZE_STRING);
    }

    if (isset($data->date)) {
        // Validate date format
        $date_obj = DateTime::createFromFormat('Y-m-d', $data->date);
        if (!$date_obj || $date_obj->format('Y-m-d') !== $data->date) {
            throw new Exception('Invalid date format. Please use YYYY-MM-DD');
        }
        $updateFields[] = "date = ?";
        $params[] = $data->date;
    }

    // If no fields to update
    if (empty($updateFields)) {
        throw new Exception('No valid fields provided for update');
    }

    // Add note ID to parameters
    $params[] = $data->id;

    // Build and execute update query
    $query = "UPDATE note SET " . implode(", ", $updateFields) . " WHERE id = ?";
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);

    // Fetch updated note
    $selectStmt = $pdo->prepare("SELECT * FROM note WHERE id = ?");
    $selectStmt->execute([$data->id]);
    $updatedNote = $selectStmt->fetch();

    // Format date for response
    $updatedNote['date'] = date('Y-m-d', strtotime($updatedNote['date']));

    // Return success response
    echo json_encode([
        'status' => 'success',
        'message' => 'Note updated successfully',
        'data' => $updatedNote
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo handleError('Database error occurred', $e);
} catch (Exception $e) {
    http_response_code(400);
    echo handleError($e->getMessage());
}
?>