<?php
require_once 'config.php';
require_once 'auth.php';

// Check admin authentication for all admin operations
requireAdminAuth();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        addBlog();
        break;
    
    case 'PUT':
        updateBlog();
        break;
    
    case 'DELETE':
        if (isset($_GET['id'])) {
            deleteBlog($_GET['id']);
        } else {
            sendResponse(['error' => 'Blog ID required for deletion'], 400);
        }
        break;
    
    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}

function addBlog() {
    // Get form data
    $title = isset($_POST['title']) ? sanitizeInput($_POST['title']) : null;
    $content = isset($_POST['content']) ? $_POST['content'] : null;
    $excerpt = isset($_POST['excerpt']) ? sanitizeInput($_POST['excerpt']) : null;
    $category_id = isset($_POST['category_id']) ? (int)$_POST['category_id'] : null;
    
    // Validation
    if (!$title || !$content || !$category_id) {
        sendResponse(['error' => 'Title, content, and category are required'], 400);
    }
    
    // Simulate blog creation
    $blog_id = rand(100, 999);
    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title)));
    
    sendResponse([
        'message' => 'Blog created successfully',
        'blog_id' => $blog_id,
        'slug' => $slug
    ], 201);
}

function updateBlog() {
    // Get JSON data for PUT request
    $input = json_decode(file_get_contents('php://input'), true);
    
    $id = isset($input['id']) ? (int)$input['id'] : null;
    $title = isset($input['title']) ? sanitizeInput($input['title']) : null;
    $content = isset($input['content']) ? $input['content'] : null;
    $category_id = isset($input['category_id']) ? (int)$input['category_id'] : null;
    
    if (!$id || !$title || !$content || !$category_id) {
        sendResponse(['error' => 'ID, title, content, and category are required'], 400);
    }
    
    sendResponse(['message' => 'Blog updated successfully']);
}

function deleteBlog($id) {
    if (!$id) {
        sendResponse(['error' => 'Invalid blog ID'], 400);
    }
    
    sendResponse(['message' => 'Blog deleted successfully']);
}
?>