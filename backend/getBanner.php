<?php
require_once 'config.php';

$database = new DatabaseConfig();
$db = $database->getConnection();

if (!$db) {
    sendResponse(['error' => 'Database connection failed'], 500);
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getBannerImages($db);
        break;
    
    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}

function getBannerImages($db) {
    try {
        $query = "SELECT * FROM banner_images WHERE is_active = 1 ORDER BY sort_order ASC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $banners = $stmt->fetchAll();
        
        // Format banner data
        $formatted_banners = array_map(function($banner) {
            return [
                'id' => (int)$banner['id'],
                'title' => $banner['title'],
                'subtitle' => $banner['subtitle'],
                'image_url' => $banner['image_url'],
                'link_url' => $banner['link_url'],
                'sort_order' => (int)$banner['sort_order']
            ];
        }, $banners);
        
        sendResponse(['banners' => $formatted_banners]);
        
    } catch (PDOException $e) {
        sendResponse(['error' => 'Database query failed: ' . $e->getMessage()], 500);
    }
}
?>