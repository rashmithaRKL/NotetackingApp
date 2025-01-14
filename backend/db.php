<?php
$host = 'localhost'; // Change if necessary
$dbname = 'myapp'; // Your database name
$username = 'root'; // Your MySQL username
$password = 'Rashmitha.rt1'; // Your MySQL password

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo 'Connection failed: ' . $e->getMessage();
}
?>