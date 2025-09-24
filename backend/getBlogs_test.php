<?php
require_once 'config.php';

// Mock blog data for testing
$blogs = [
    [
        'id' => 1,
        'title' => 'Introduction to Modern Web Development',
        'slug' => 'intro-modern-web-dev',
        'content' => '<p>This is a comprehensive guide to modern web development...</p>',
        'excerpt' => 'Learn the fundamentals of modern web development',
        'featured_image' => '/uploads/blog1.jpg',
        'category_id' => 3,
        'category_name' => 'Technology',
        'tags' => 'web, development, javascript',
        'meta_title' => 'Introduction to Modern Web Development',
        'meta_description' => 'Learn modern web development techniques',
        'is_featured' => true,
        'status' => 'published',
        'created_at' => '2024-01-15 10:00:00',
        'updated_at' => '2024-01-15 10:00:00'
    ],
    [
        'id' => 2,
        'title' => 'Healthy Living Tips',
        'slug' => 'healthy-living-tips',
        'content' => '<p>Here are some essential tips for healthy living...</p>',
        'excerpt' => 'Essential tips for maintaining a healthy lifestyle',
        'featured_image' => '/uploads/blog2.jpg',
        'category_id' => 4,
        'category_name' => 'Health',
        'tags' => 'health, wellness, lifestyle',
        'meta_title' => 'Healthy Living Tips',
        'meta_description' => 'Tips for healthy living',
        'is_featured' => false,
        'status' => 'published',
        'created_at' => '2024-01-10 15:00:00',
        'updated_at' => '2024-01-10 15:00:00'
    ]
];

// Handle different request types
if (isset($_GET['id'])) {
    $id = (int)$_GET['id'];
    $blog = array_filter($blogs, function($b) use ($id) { return $b['id'] == $id; });
    if ($blog) {
        sendResponse(['success' => true, 'blog' => array_values($blog)[0]]);
    } else {
        sendResponse(['error' => 'Blog not found'], 404);
    }
} elseif (isset($_GET['slug'])) {
    $slug = $_GET['slug'];
    $blog = array_filter($blogs, function($b) use ($slug) { return $b['slug'] == $slug; });
    if ($blog) {
        sendResponse(['success' => true, 'blog' => array_values($blog)[0]]);
    } else {
        sendResponse(['error' => 'Blog not found'], 404);
    }
} else {
    // Return all blogs
    sendResponse([
        'success' => true,
        'blogs' => $blogs,
        'total' => count($blogs),
        'page' => 1,
        'limit' => 10
    ]);
}
?>