<?php
header('Content-Type: application/json');
require_once 'db.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed. Please use GET.'
    ]);
    exit();
}

try {
    // Initialize query parameters
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    $category = isset($_GET['category']) ? $_GET['category'] : null;
    $search = isset($_GET['search']) ? $_GET['search'] : null;
    $sort = isset($_GET['sort']) ? $_GET['sort'] : 'date';
    $order = isset($_GET['order']) ? strtoupper($_GET['order']) : 'DESC';

    // Validate and sanitize parameters
    $page = max(1, $page);
    $limit = max(1, min(50, $limit)); // Limit between 1 and 50
    $offset = ($page - 1) * $limit;
    
    // Validate sort field
    $allowed_sort_fields = ['date', 'title', 'category'];
    if (!in_array($sort, $allowed_sort_fields)) {
        $sort = 'date';
    }
    
    // Validate order
    if (!in_array($order, ['ASC', 'DESC'])) {
        $order = 'DESC';
    }

    // Build the base query
    $query = "SELECT SQL_CALC_FOUND_ROWS * FROM note WHERE 1=1";
    $params = [];

    // Add category filter if specified
    if ($category && $category !== 'All') {
        $query .= " AND category = ?";
        $params[] = $category;
    }

    // Add search functionality if specified
    if ($search) {
        $query .= " AND (title LIKE ? OR content LIKE ?)";
        $searchTerm = "%{$search}%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
    }

    // Add sorting
    $query .= " ORDER BY {$sort} {$order}";

    // Add pagination
    $query .= " LIMIT ? OFFSET ?";
    $params[] = $limit;
    $params[] = $offset;

    // Execute the main query
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $notes = $stmt->fetchAll();

    // Get total count for pagination
    $totalStmt = $pdo->query("SELECT FOUND_ROWS()");
    $totalNotes = $totalStmt->fetchColumn();
    $totalPages = ceil($totalNotes / $limit);

    // Format dates and prepare response
    foreach ($notes as &$note) {
        $note['date'] = date('Y-m-d', strtotime($note['date']));
    }

    // Return success response with pagination info
    echo json_encode([
        'status' => 'success',
        'data' => [
            'notes' => $notes,
            'pagination' => [
                'current_page' => $page,
                'total_pages' => $totalPages,
                'total_notes' => $totalNotes,
                'limit' => $limit
            ],
            'filters' => [
                'category' => $category,
                'search' => $search,
                'sort' => $sort,
                'order' => $order
            ]
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