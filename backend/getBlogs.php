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
        if (isset($_GET['id'])) {
            // Get single blog by ID
            getBlogById($db, $_GET['id']);
        } elseif (isset($_GET['slug'])) {
            // Get single blog by slug
            getBlogBySlug($db, $_GET['slug']);
        } else {
            // Get all blogs with filters
            getAllBlogs($db);
        }
        break;
    
    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}

function getAllBlogs($db) {
    // Get query parameters
    $category = isset($_GET['category']) ? sanitizeInput($_GET['category']) : null;
    $tag = isset($_GET['tag']) ? sanitizeInput($_GET['tag']) : null;
    $featured = isset($_GET['featured']) ? (bool)$_GET['featured'] : null;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : null;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    $search = isset($_GET['search']) ? sanitizeInput($_GET['search']) : null;
    $status = isset($_GET['status']) ? sanitizeInput($_GET['status']) : null;
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;

    // Check if this is an admin request (should show all statuses)
    $is_admin_request = strpos($_SERVER['REQUEST_URI'], '/admin/') !== false || isset($_GET['admin']);
    
    // Build base query
    $query = "SELECT b.*, c.name as category_name, c.slug as category_slug 
              FROM blogs b 
              LEFT JOIN categories c ON b.category_id = c.id 
              WHERE 1=1";
    
    $params = [];
    
    // Filter by status
    if (!$is_admin_request) {
        $query .= " AND b.status = 'published'";
    } elseif ($status && $status !== 'all') {
        $query .= " AND b.status = :status";
        $params['status'] = $status;
    }
    
    if ($category) {
        $query .= " AND c.slug = :category";
        $params['category'] = $category;
    }
    
    if ($tag) {
        $query .= " AND b.tags LIKE :tag";
        $params['tag'] = "%{$tag}%";
    }
    
    if ($featured !== null) {
        $query .= " AND b.is_featured = :featured";
        $params['featured'] = $featured ? 1 : 0;
    }
    
    if ($search) {
        $query .= " AND (b.title LIKE :search OR b.content LIKE :search OR b.tags LIKE :search)";
        $params['search'] = "%{$search}%";
    }
    
    // Get total count for pagination
    $count_query = "SELECT COUNT(*) as total FROM ($query) as count_table";
    $count_stmt = $db->prepare($count_query);
    foreach ($params as $key => $value) {
        $count_stmt->bindValue(":$key", $value);
    }
    $count_stmt->execute();
    $total = $count_stmt->fetch()['total'];
    
    $query .= " ORDER BY b.created_at DESC";
    
    // Handle pagination
    if ($limit || $page > 1) {
        if (!$limit) $limit = 10; // default limit for pagination
        $offset = ($page - 1) * $limit;
        $query .= " LIMIT :limit OFFSET :offset";
        $params['limit'] = $limit;
        $params['offset'] = $offset;
    }

    try {
        $stmt = $db->prepare($query);
        
        foreach ($params as $key => $value) {
            if (in_array($key, ['limit', 'offset', 'featured'])) {
                $stmt->bindValue(":$key", $value, PDO::PARAM_INT);
            } else {
                $stmt->bindValue(":$key", $value);
            }
        }
        
        $stmt->execute();
        $blogs = $stmt->fetchAll();
        
        // Format blogs data
        $formatted_blogs = array_map('formatBlog', $blogs);
        
        // Load related books for admin requests
        if ($is_admin_request) {
            foreach ($formatted_blogs as &$blog) {
                $books_query = "SELECT * FROM related_books WHERE blog_id = :blog_id ORDER BY id ASC";
                $books_stmt = $db->prepare($books_query);
                $books_stmt->bindParam(':blog_id', $blog['id'], PDO::PARAM_INT);
                $books_stmt->execute();
                $blog['related_books'] = $books_stmt->fetchAll(PDO::FETCH_ASSOC);
            }
        }
        
        $response = [
            'blogs' => $formatted_blogs,
            'total' => (int)$total,
            'page' => $page,
            'limit' => $limit ?: count($formatted_blogs),
            'total_pages' => $limit ? ceil($total / $limit) : 1
        ];
        
        sendResponse($response);
        
    } catch (PDOException $e) {
        sendResponse(['error' => 'Database query failed: ' . $e->getMessage()], 500);
    }
}

function getBlogById($db, $id) {
    try {
        $query = "SELECT b.*, c.name as category_name, c.slug as category_slug 
                  FROM blogs b 
                  LEFT JOIN categories c ON b.category_id = c.id 
                  WHERE b.id = :id AND b.status = 'published'";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        
        $blog = $stmt->fetch();
        
        if (!$blog) {
            sendResponse(['error' => 'Blog not found'], 404);
        }
        
        // Increment view count
        $update_query = "UPDATE blogs SET view_count = view_count + 1 WHERE id = :id";
        $update_stmt = $db->prepare($update_query);
        $update_stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $update_stmt->execute();
        
        // Get related books
        $books_query = "SELECT * FROM related_books WHERE blog_id = :blog_id ORDER BY id ASC";
        $books_stmt = $db->prepare($books_query);
        $books_stmt->bindParam(':blog_id', $id, PDO::PARAM_INT);
        $books_stmt->execute();
        $related_books = $books_stmt->fetchAll();
        
        $blog = formatBlog($blog);
        $blog['related_books'] = $related_books;
        
        sendResponse(['blog' => $blog]);
        
    } catch (PDOException $e) {
        sendResponse(['error' => 'Database query failed: ' . $e->getMessage()], 500);
    }
}

function getBlogBySlug($db, $slug) {
    try {
        $query = "SELECT b.*, c.name as category_name, c.slug as category_slug 
                  FROM blogs b 
                  LEFT JOIN categories c ON b.category_id = c.id 
                  WHERE b.slug = :slug AND b.status = 'published'";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':slug', $slug);
        $stmt->execute();
        
        $blog = $stmt->fetch();
        
        if (!$blog) {
            sendResponse(['error' => 'Blog not found'], 404);
        }
        
        // Increment view count
        $update_query = "UPDATE blogs SET view_count = view_count + 1 WHERE slug = :slug";
        $update_stmt = $db->prepare($update_query);
        $update_stmt->bindParam(':slug', $slug);
        $update_stmt->execute();
        
        // Get related books
        $books_query = "SELECT * FROM related_books WHERE blog_id = :blog_id ORDER BY id ASC";
        $books_stmt = $db->prepare($books_query);
        $books_stmt->bindParam(':blog_id', $blog['id'], PDO::PARAM_INT);
        $books_stmt->execute();
        $related_books = $books_stmt->fetchAll();
        
        $blog = formatBlog($blog);
        $blog['related_books'] = $related_books;
        
        sendResponse(['blog' => $blog]);
        
    } catch (PDOException $e) {
        sendResponse(['error' => 'Database query failed: ' . $e->getMessage()], 500);
    }
}

function formatBlog($blog) {
    if (!$blog) return $blog;
    
    return [
        'id' => (int)$blog['id'],
        'title' => $blog['title'],
        'slug' => $blog['slug'],
        'content' => $blog['content'],
        'excerpt' => $blog['excerpt'],
        'featured_image' => $blog['featured_image'],
        'category_id' => (int)$blog['category_id'],
        'category_name' => $blog['category_name'],
        'category_slug' => $blog['category_slug'],
        'category' => [
            'id' => (int)$blog['category_id'],
            'name' => $blog['category_name'],
            'slug' => $blog['category_slug']
        ],
        'tags' => $blog['tags'] ? explode(',', $blog['tags']) : [],
        'meta_title' => $blog['meta_title'] ?? '',
        'meta_description' => $blog['meta_description'] ?? '',
        'is_featured' => (bool)$blog['is_featured'],
        'status' => $blog['status'],
        'view_count' => (int)$blog['view_count'],
        'created_at' => $blog['created_at'],
        'updated_at' => $blog['updated_at']
    ];
}
?>