<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Error handling function
function handleError($message, $error = null) {
    $response = [
        'status' => 'error',
        'message' => $message
    ];
    
    // Log the actual error for debugging (in production, use proper logging)
    if ($error && getenv('ENVIRONMENT') !== 'production') {
        $response['debug'] = $error->getMessage();
    }
    
    return json_encode($response);
}

// Database configuration
$config = [
    'host' => 'localhost',
    'dbname' => 'myapp',
    'username' => 'root',
    'password' => 'Rashmitha.rt1'
];

try {
    $dsn = "mysql:host={$config['host']};dbname={$config['dbname']};charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ];
    
    $pdo = new PDO($dsn, $config['username'], $config['password'], $options);
} catch (PDOException $e) {
    http_response_code(500);
    die(handleError('Database connection failed', $e));
}

// Utility function to validate required fields
function validateFields($data, $required_fields) {
    $errors = [];
    foreach ($required_fields as $field) {
        if (!isset($data->$field) || empty(trim($data->$field))) {
            $errors[] = "$field is required";
        }
    }
    return $errors;
}
?>