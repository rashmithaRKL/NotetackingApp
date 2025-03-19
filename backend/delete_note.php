<?php
header('Content-Type: application/json');
require_once 'db.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed. Please use DELETE or POST.'
    ]);
    exit();
}

try {
    // Get note ID from request
    $json = file_get_contents('php://input');
    $data = json_decode($json);

    if (!$data || !isset($data->id) || !is_numeric($data->id)) {
        throw new Exception('Valid note ID is required');
    }

    $noteId = (int)$data->id;

    // Check if note exists before deletion
    $checkStmt = $pdo->prepare("SELECT id FROM note WHERE id = ?");
    $checkStmt->execute([$noteId]);
    
    if (!$checkStmt->fetch()) {
        http_response_code(404);
        echo json_encode([
            'status' => 'error',
            'message' => 'Note not found'
        ]);
        exit();
    }

    // Delete the note
    $deleteStmt = $pdo->prepare("DELETE FROM note WHERE id = ?");
    $deleteStmt->execute([$noteId]);

    // Check if deletion was successful
    if ($deleteStmt->rowCount() > 0) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Note deleted successfully',
            'data' => [
                'id' => $noteId
            ]
        ]);
    } else {
        throw new Exception('Failed to delete note');
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo handleError('Database error occurred', $e);
} catch (Exception $e) {
    http_response_code(400);
    echo handleError($e->getMessage());
}
?>