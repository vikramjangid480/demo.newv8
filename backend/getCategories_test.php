<?php
require_once 'config.php';

// Mock categories data for testing
$categories = [
    ['id' => 1, 'name' => 'Fiction', 'slug' => 'fiction', 'description' => 'Fictional works', 'blog_count' => 5],
    ['id' => 2, 'name' => 'Non-Fiction', 'slug' => 'non-fiction', 'description' => 'Non-fictional works', 'blog_count' => 3],
    ['id' => 3, 'name' => 'Technology', 'slug' => 'technology', 'description' => 'Technology articles', 'blog_count' => 8],
    ['id' => 4, 'name' => 'Health', 'slug' => 'health', 'description' => 'Health and wellness', 'blog_count' => 2],
    ['id' => 5, 'name' => 'Business', 'slug' => 'business', 'description' => 'Business and economy', 'blog_count' => 4]
];

sendResponse(['success' => true, 'categories' => $categories]);
?>