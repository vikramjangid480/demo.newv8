<?php
require_once 'config.php';
require_once 'auth.php';

// Check admin authentication for all admin operations
requireAdminAuth();

$database = new DatabaseConfig();
$db = $database->getConnection();

if (!$db) {
    sendResponse(['error' => 'Database connection failed'], 500);
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        addBlog($db);
        break;
    
    case 'PUT':
        updateBlog($db);
        break;
    
    case 'DELETE':
        if (isset($_GET['id'])) {
            deleteBlog($db, $_GET['id']);
        } else {
            sendResponse(['error' => 'Blog ID required for deletion'], 400);
        }
        break;
    
    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}

function addBlog($db) {
    try {
        // Get form data
        $title = isset($_POST['title']) ? sanitizeInput($_POST['title']) : null;
        $content = isset($_POST['content']) ? $_POST['content'] : null;
        $excerpt = isset($_POST['excerpt']) ? sanitizeInput($_POST['excerpt']) : null;
        $category_id = isset($_POST['category_id']) ? (int)$_POST['category_id'] : null;
        $tags = isset($_POST['tags']) ? sanitizeInput($_POST['tags']) : '';
        $meta_title = isset($_POST['meta_title']) ? sanitizeInput($_POST['meta_title']) : $title;
        $meta_description = isset($_POST['meta_description']) ? sanitizeInput($_POST['meta_description']) : $excerpt;
        $is_featured = isset($_POST['is_featured']) ? (bool)$_POST['is_featured'] : false;
        $status = isset($_POST['status']) ? sanitizeInput($_POST['status']) : 'draft';
        
        // Validation
        if (!$title || !$content || !$category_id) {
            sendResponse(['error' => 'Title, content, and category are required'], 400);
        }
        
        // Generate slug
        $slug = generateSlug($title);
        
        // Check if slug already exists
        $check_slug = "SELECT id FROM blogs WHERE slug = :slug";
        $check_stmt = $db->prepare($check_slug);
        $check_stmt->bindParam(':slug', $slug);
        $check_stmt->execute();
        
        if ($check_stmt->fetch()) {
            $slug = $slug . '-' . time();
        }
        
        // Handle file upload
        $featured_image = null;
        if (isset($_FILES['featured_image'])) {
            $featured_image = uploadFile($_FILES['featured_image']);
            if (!$featured_image && $_FILES['featured_image']['error'] !== UPLOAD_ERR_NO_FILE) {
                sendResponse(['error' => 'Failed to upload featured image'], 400);
            }
        }
        
        // Generate excerpt if not provided
        if (!$excerpt && $content) {
            $excerpt = substr(strip_tags($content), 0, 200) . '...';
        }
        
        // Insert blog
        $query = "INSERT INTO blogs (title, slug, content, excerpt, featured_image, category_id, tags, meta_title, meta_description, is_featured, status) 
                  VALUES (:title, :slug, :content, :excerpt, :featured_image, :category_id, :tags, :meta_title, :meta_description, :is_featured, :status)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':slug', $slug);
        $stmt->bindParam(':content', $content);
        $stmt->bindParam(':excerpt', $excerpt);
        $stmt->bindParam(':featured_image', $featured_image);
        $stmt->bindParam(':category_id', $category_id, PDO::PARAM_INT);
        $stmt->bindParam(':tags', $tags);
        $stmt->bindParam(':meta_title', $meta_title);
        $stmt->bindParam(':meta_description', $meta_description);
        $stmt->bindParam(':is_featured', $is_featured, PDO::PARAM_BOOL);
        $stmt->bindParam(':status', $status);
        
        $stmt->execute();
        $blog_id = $db->lastInsertId();
        
        // Handle related books
        if (isset($_POST['related_books']) && $_POST['related_books']) {
            $related_books = json_decode($_POST['related_books'], true);
            if ($related_books && is_array($related_books)) {
                addRelatedBooks($db, $blog_id, $related_books);
            }
        }
        
        sendResponse(['message' => 'Blog created successfully', 'blog_id' => $blog_id, 'slug' => $slug], 201);
        
    } catch (PDOException $e) {
        sendResponse(['error' => 'Failed to create blog: ' . $e->getMessage()], 500);
    }
}

function updateBlog($db) {
    try {
        // Get JSON data for PUT request
        $input = json_decode(file_get_contents('php://input'), true);
        
        $id = isset($input['id']) ? (int)$input['id'] : null;
        $title = isset($input['title']) ? sanitizeInput($input['title']) : null;
        $content = isset($input['content']) ? $input['content'] : null;
        $excerpt = isset($input['excerpt']) ? sanitizeInput($input['excerpt']) : null;
        $category_id = isset($input['category_id']) ? (int)$input['category_id'] : null;
        $tags = isset($input['tags']) ? sanitizeInput($input['tags']) : '';
        $meta_title = isset($input['meta_title']) ? sanitizeInput($input['meta_title']) : null;
        $meta_description = isset($input['meta_description']) ? sanitizeInput($input['meta_description']) : null;
        $is_featured = isset($input['is_featured']) ? (bool)$input['is_featured'] : false;
        $status = isset($input['status']) ? sanitizeInput($input['status']) : 'draft';
        
        if (!$id || !$title || !$content || !$category_id) {
            sendResponse(['error' => 'ID, title, content, and category are required'], 400);
        }
        
        // Update blog
        $query = "UPDATE blogs SET title = :title, content = :content, excerpt = :excerpt, category_id = :category_id, 
                  tags = :tags, meta_title = :meta_title, meta_description = :meta_description, is_featured = :is_featured, 
                  status = :status, updated_at = NOW() WHERE id = :id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':content', $content);
        $stmt->bindParam(':excerpt', $excerpt);
        $stmt->bindParam(':category_id', $category_id, PDO::PARAM_INT);
        $stmt->bindParam(':tags', $tags);
        $stmt->bindParam(':meta_title', $meta_title);
        $stmt->bindParam(':meta_description', $meta_description);
        $stmt->bindParam(':is_featured', $is_featured, PDO::PARAM_BOOL);
        $stmt->bindParam(':status', $status);
        
        $stmt->execute();
        
        sendResponse(['message' => 'Blog updated successfully']);
        
    } catch (PDOException $e) {
        sendResponse(['error' => 'Failed to update blog: ' . $e->getMessage()], 500);
    }
}

function deleteBlog($db, $id) {
    try {
        $query = "DELETE FROM blogs WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            sendResponse(['message' => 'Blog deleted successfully']);
        } else {
            sendResponse(['error' => 'Blog not found'], 404);
        }
        
    } catch (PDOException $e) {
        sendResponse(['error' => 'Failed to delete blog: ' . $e->getMessage()], 500);
    }
}

function addRelatedBooks($db, $blog_id, $books) {
    try {
        // Delete existing related books
        $delete_query = "DELETE FROM related_books WHERE blog_id = :blog_id";
        $delete_stmt = $db->prepare($delete_query);
        $delete_stmt->bindParam(':blog_id', $blog_id, PDO::PARAM_INT);
        $delete_stmt->execute();
        
        // Add new related books
        $insert_query = "INSERT INTO related_books (blog_id, title, author, purchase_link, description, price) 
                         VALUES (:blog_id, :title, :author, :purchase_link, :description, :price)";
        $insert_stmt = $db->prepare($insert_query);
        
        foreach ($books as $book) {
            if (isset($book['title']) && isset($book['purchase_link'])) {
                $insert_stmt->bindParam(':blog_id', $blog_id, PDO::PARAM_INT);
                $insert_stmt->bindParam(':title', $book['title']);
                $insert_stmt->bindParam(':author', $book['author'] ?? '');
                $insert_stmt->bindParam(':purchase_link', $book['purchase_link']);
                $insert_stmt->bindParam(':description', $book['description'] ?? '');
                $insert_stmt->bindParam(':price', $book['price'] ?? '');
                $insert_stmt->execute();
            }
        }
        
    } catch (PDOException $e) {
        // Log error but don't fail the main operation
        error_log('Failed to add related books: ' . $e->getMessage());
    }
}
?>