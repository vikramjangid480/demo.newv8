-- Boganto Blog Database Schema
-- Full-stack blog website with categories, blogs, and related books

CREATE DATABASE IF NOT EXISTS boganto_blog;
USE boganto_blog;

-- Admins table for authentication
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'superadmin') DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_active (is_active)
);

-- Categories table with all required categories
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blogs table
CREATE TABLE blogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content LONGTEXT NOT NULL,
    excerpt TEXT,
    featured_image VARCHAR(255),
    category_id INT,
    tags VARCHAR(500),
    meta_title VARCHAR(255),
    meta_description TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_category (category_id),
    INDEX idx_status (status),
    INDEX idx_featured (is_featured),
    INDEX idx_created (created_at),
    FULLTEXT idx_search (title, content, tags)
);

-- Related Books table
CREATE TABLE related_books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    blog_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    purchase_link VARCHAR(500) NOT NULL,
    image_url VARCHAR(255),
    description TEXT,
    price VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
    INDEX idx_blog (blog_id)
);

-- Banner/Carousel Images table
CREATE TABLE banner_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    image_url VARCHAR(255) NOT NULL,
    link_url VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_active_order (is_active, sort_order)
);

-- Insert all required categories
INSERT INTO categories (name, slug, description) VALUES
('Fiction', 'fiction', 'Fiction books and literature'),
('History', 'history', 'Historical books and content'),
('Self-Help', 'self-help', 'Self-help and personal development'),
('Kids', 'kids', 'Children books and content'),
('Science', 'science', 'Science and technology'),
('Antiques & Collectibles', 'antiques-collectibles', 'Antiques and collectible items'),
('Architecture & Designing', 'architecture-designing', 'Architecture and design'),
('Art & Creativity', 'art-creativity', 'Art and creative content'),
('Automotive & Transportation', 'automotive-transportation', 'Automotive and transportation'),
('Bibles & References', 'bibles-references', 'Religious texts and references'),
('Biography & Autobiography', 'biography-autobiography', 'Life stories and biographies'),
('Business & Economics', 'business-economics', 'Business and economic content'),
('Children''s Fiction', 'childrens-fiction', 'Fiction for children'),
('Children''s Nonfiction', 'childrens-nonfiction', 'Non-fiction for children'),
('Comics & Mangas', 'comics-mangas', 'Comics and manga content'),
('Computer & Internet', 'computer-internet', 'Technology and internet'),
('Cook Book', 'cook-book', 'Cooking and recipes'),
('Crafts & Hobbies', 'crafts-hobbies', 'Crafts and hobby content'),
('Designs & Fashion', 'designs-fashion', 'Fashion and design'),
('Drama', 'drama', 'Drama and theatrical content'),
('Family Life & Parenting', 'family-life-parenting', 'Family and parenting'),
('Games & Activities', 'games-activities', 'Games and recreational activities'),
('Gardening', 'gardening', 'Gardening and horticulture'),
('Health & Fitness', 'health-fitness', 'Health and fitness'),
('Home & Lifestyle', 'home-lifestyle', 'Home improvement and lifestyle'),
('Humor', 'humor', 'Comedy and humor'),
('Language Arts & Disciplines', 'language-arts-disciplines', 'Language and linguistics'),
('Language Learning', 'language-learning', 'Foreign language learning'),
('Law', 'law', 'Legal content and law'),
('Literary Collections', 'literary-collections', 'Literary collections'),
('Literary Criticism', 'literary-criticism', 'Literary analysis and criticism'),
('Mathematics', 'mathematics', 'Mathematics and mathematical content'),
('Medical', 'medical', 'Medical and healthcare'),
('Music & Musical Instruments', 'music-musical-instruments', 'Music and instruments'),
('Performing Arts', 'performing-arts', 'Theater, dance, and performing arts'),
('Pets & Animal Care', 'pets-animal-care', 'Pet care and animals'),
('Philosophy', 'philosophy', 'Philosophy and philosophical thought'),
('Photography & Collections', 'photography-collections', 'Photography and visual collections'),
('Poetry', 'poetry', 'Poetry and poetic works'),
('Political Science', 'political-science', 'Politics and government'),
('Positive Energy & Spirituality', 'positive-energy-spirituality', 'Spirituality and positive thinking'),
('Psychology', 'psychology', 'Psychology and mental health'),
('Reference Books & Maps', 'reference-books-maps', 'Reference materials and maps'),
('Religion', 'religion', 'Religious content'),
('Social Science', 'social-science', 'Social sciences'),
('Sports & Recreation', 'sports-recreation', 'Sports and recreational activities'),
('Stationery & Toys', 'stationery-toys', 'Stationery and toys'),
('Study Aids & Exam Preparation', 'study-aids-exam-preparation', 'Educational aids and test prep'),
('Study Material', 'study-material', 'Educational study materials'),
('Technology & Engineering', 'technology-engineering', 'Technology and engineering'),
('Travel & Tourism', 'travel-tourism', 'Travel and tourism'),
('True Crime', 'true-crime', 'True crime stories'),
('Wildlife & Nature', 'wildlife-nature', 'Wildlife and nature'),
('Young Adult Fiction', 'young-adult-fiction', 'Fiction for young adults'),
('Young Adult Nonfiction', 'young-adult-nonfiction', 'Non-fiction for young adults'),
('Calendar 2025', 'calendar-2025', 'Calendars and planners'),
('Games', 'games', 'Games and gaming'),
('Toys', 'toys', 'Toys and playthings');

-- Insert sample banner images
INSERT INTO banner_images (title, subtitle, image_url, link_url, sort_order) VALUES
('Building Your Personal Library', 'Essential tips for curating a collection that reflects your personality', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', '/blog/building-personal-library-complete-guide', 1),
('The Art of Storytelling', 'Discover the magic behind captivating narratives', 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', '/blog/art-storytelling-modern-literature', 2),
('Ancient Libraries', 'Guardians of knowledge through the ages', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', '/blog/ancient-libraries-guardians-knowledge', 3),
('Science Books', 'Revolutionary publications that changed our world', 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', '/blog/books-changed-science-forever', 4),
('Modern Literature', 'Exploring contemporary narrative techniques', 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', '/blog/art-storytelling-modern-literature', 5);

-- Insert sample blog posts
INSERT INTO blogs (title, slug, content, excerpt, featured_image, category_id, tags, is_featured, status) VALUES
('Building Your Personal Library: A Complete Guide', 'building-personal-library-complete-guide', 
'<h2>Introduction</h2><p>Building a personal library is more than just collecting books—it\'s about creating a curated space that reflects your interests, values, and intellectual journey...</p><h2>Choosing Your Focus</h2><p>The first step in building your personal library is determining what genres and topics resonate with you most...</p><h2>Quality Over Quantity</h2><p>While it might be tempting to fill your shelves with as many books as possible, focusing on quality selections will serve you better in the long run...</p><h2>Organization Strategies</h2><p>How you organize your library can significantly impact your reading experience...</p><h2>Building on a Budget</h2><p>Creating an impressive personal library doesn\'t require breaking the bank...</p>', 
'Essential tips for curating a collection that reflects your personality and interests', 
'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
1, 
'library, books, reading, collection, personal development', 
TRUE, 
'published'),

('The Evolution of Fantasy Literature', 'evolution-fantasy-literature', 
'<h2>From Tolkien to Modern Fantasy</h2><p>Fantasy literature has undergone tremendous evolution since the publication of The Lord of the Rings...</p><h2>Contemporary Voices</h2><p>Today\'s fantasy authors bring diverse perspectives and innovative storytelling techniques...</p><h2>World-Building Techniques</h2><p>Modern fantasy places great emphasis on detailed world-building...</p>', 
'Exploring how fantasy literature has transformed over the decades', 
'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
1, 
'fantasy, literature, evolution, tolkien, world-building', 
TRUE, 
'published'),

('Ancient Libraries: Guardians of Knowledge', 'ancient-libraries-guardians-knowledge', 
'<h2>The Library of Alexandria</h2><p>Perhaps the most famous ancient library, Alexandria represented the pinnacle of scholarly achievement...</p><h2>Mesopotamian Archives</h2><p>Long before Alexandria, ancient Mesopotamian civilizations maintained extensive archives...</p><h2>Preservation Challenges</h2><p>Ancient librarians faced unique challenges in preserving knowledge...</p>', 
'Discover the fascinating history of ancient libraries and their role in preserving human knowledge', 
'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
2, 
'history, libraries, ancient, knowledge, preservation', 
TRUE, 
'published'),

('Books That Changed Science Forever', 'books-changed-science-forever', 
'<h2>Revolutionary Scientific Works</h2><p>Throughout history, certain books have fundamentally changed our understanding of the world...</p><h2>Darwin\'s Origin of Species</h2><p>Perhaps no scientific work has been more influential or controversial...</p><h2>Newton\'s Principia</h2><p>The mathematical principles laid out in this work formed the foundation of classical physics...</p>', 
'Revolutionary publications that transformed our understanding of the world', 
'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
5, 
'science, history, revolutionary, darwin, newton, knowledge', 
FALSE, 
'published'),

('The Art of Storytelling in Modern Literature', 'art-storytelling-modern-literature', 
'<h2>The Evolution of Narrative</h2><p>Storytelling has evolved significantly in modern literature, with authors experimenting with new forms and techniques...</p><h2>Character Development in the Digital Age</h2><p>Modern authors face unique challenges in developing characters that resonate with contemporary audiences...</p><h2>The Role of Technology in Storytelling</h2><p>Technology has not only changed how we read but also how stories are told...</p><h2>Interactive and Multimedia Elements</h2><p>Some modern works incorporate multimedia elements that enhance the reading experience...</p><h2>The Future of Literary Innovation</h2><p>As we look ahead, the possibilities for storytelling continue to expand...</p>', 
'Exploring how contemporary authors are revolutionizing narrative techniques', 
'https://images.unsplash.com/photo-1516979187457-637abb4f9353?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
1, 
'storytelling, modern literature, narrative, character development, innovation', 
FALSE, 
'published');

-- Insert related books for the blogs
INSERT INTO related_books (blog_id, title, purchase_link, description, price) VALUES
(1, 'The Library Book by Susan Orlean', 'https://www.amazon.com/Library-Book-Susan-Orlean/dp/1476740186', 'A fascinating exploration of libraries and their cultural significance', '$15.99'),
(1, 'The Name of the Rose by Umberto Eco', 'https://www.amazon.com/Name-Rose-Umberto-Eco/dp/0544176561', 'A medieval mystery set in a monastery library', '$16.99'),
(2, 'The Lord of the Rings by J.R.R. Tolkien', 'https://www.amazon.com/Lord-Rings-J-R-R-Tolkien/dp/0544003411', 'The foundational work of modern fantasy literature', '$22.99'),
(2, 'The Name of the Wind by Patrick Rothfuss', 'https://www.amazon.com/Name-Wind-Patrick-Rothfuss/dp/0756404746', 'A modern fantasy masterpiece', '$17.99'),
(3, 'The Library of Alexandria by Roy MacLeod', 'https://www.amazon.com/Library-Alexandria-Roy-MacLeod/dp/1860646549', 'Comprehensive history of the ancient world\'s greatest library', '$19.99'),
(4, 'On the Origin of Species by Charles Darwin', 'https://www.amazon.com/Origin-Species-Charles-Darwin/dp/1503297063', 'The revolutionary work that changed biology forever', '$12.99'),
(4, 'Principia by Isaac Newton', 'https://www.amazon.com/Principia-Mathematical-Principles-Natural-Philosophy/dp/0520088174', 'The mathematical foundation of classical physics', '$24.99'),
(5, 'The Art of Fiction by John Gardner', 'https://www.amazon.com/Art-Fiction-Notes-Craft-Writers/dp/0679734031', 'Essential guide to the craft of writing', '$14.99'),
(5, 'Story by Robert McKee', 'https://www.amazon.com/Story-Structure-Style-Principles-Screenwriting/dp/0060391685', 'Masterclass in storytelling structure', '$18.99');

-- Insert admin accounts with hashed passwords
-- Password: secure@123 -> $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- Password: admin123 -> $2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm
-- Password: boganto@2024 -> $2y$10$sjaKvJJHlbKCJY9sHSUIFufrOLxUEvQPP8rV6OXjsQWDlCaQ5QGfO

INSERT INTO admins (username, email, password, name, role) VALUES
('admin123', 'admin123@boganto.com', 'secure@123', 'Primary Administrator', 'superadmin'),
('admin', 'admin@boganto.com', 'admin_123', 'Administrator', 'admin'),
('boganto_admin', 'boganto@boganto.com', 'boganto_123', 'Boganto Administrator', 'admin');