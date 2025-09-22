const express = require('express');
const cors = require('cors');
const path = require('path');

// Configuration
const PORT = process.env.PORT || 8000;
const HOST = '0.0.0.0';

// Test data (converted from PHP test_data.php)
const testCategories = [
  { id: 1, name: 'Fiction', slug: 'fiction' },
  { id: 2, name: 'History', slug: 'history' },
  { id: 3, name: 'Science', slug: 'science' },
  { id: 4, name: 'Self-Help', slug: 'self-help' },
  { id: 5, name: 'Technology', slug: 'technology' }
];

const testBlogs = [
  {
    id: 1,
    title: 'Building Your Personal Library: A Complete Guide',
    slug: 'building-personal-library-complete-guide',
    content: '<h2>Introduction</h2><p>Building a personal library is more than just collecting books—it\'s about creating a curated space that reflects your interests, values, and intellectual journey. Whether you\'re starting from scratch or looking to reorganize your existing collection, this comprehensive guide will help you create a library that truly serves your needs.</p><h3>Why Build a Personal Library?</h3><p>In our digital age, you might wonder why physical books still matter. Personal libraries offer several unique benefits...</p>',
    excerpt: 'Essential tips for curating a collection that reflects your personality and interests',
    featured_image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category_id: 1,
    category_name: 'Fiction',
    category_slug: 'fiction',
    category: { id: 1, name: 'Fiction', slug: 'fiction' },
    tags: ['library', 'books', 'reading', 'collection', 'personal development'],
    meta_title: 'Building Your Personal Library: A Complete Guide',
    meta_description: 'Essential tips for curating a collection that reflects your personality',
    is_featured: true,
    status: 'published',
    view_count: 125,
    created_at: '2024-01-15 10:30:00',
    updated_at: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    title: 'The Evolution of Fantasy Literature',
    slug: 'evolution-fantasy-literature',
    content: '<h2>From Tolkien to Modern Fantasy</h2><p>Fantasy literature has undergone tremendous evolution since the publication of The Lord of the Rings. What began as a niche genre has transformed into one of the most popular and diverse categories in modern literature.</p><h3>The Foundation Era</h3><p>J.R.R. Tolkien\'s Middle-earth novels established many of the conventions we associate with fantasy today...</p>',
    excerpt: 'Exploring how fantasy literature has transformed over the decades',
    featured_image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category_id: 1,
    category_name: 'Fiction',
    category_slug: 'fiction',
    category: { id: 1, name: 'Fiction', slug: 'fiction' },
    tags: ['fantasy', 'literature', 'evolution', 'tolkien', 'world-building'],
    meta_title: 'The Evolution of Fantasy Literature',
    meta_description: 'Exploring how fantasy literature has transformed over decades',
    is_featured: false,
    status: 'published',
    view_count: 89,
    created_at: '2024-01-10 14:20:00',
    updated_at: '2024-01-10 14:20:00'
  },
  {
    id: 3,
    title: 'Ancient Libraries: Guardians of Knowledge',
    slug: 'ancient-libraries-guardians-knowledge',
    content: '<h2>The Library of Alexandria</h2><p>Perhaps the most famous ancient library, Alexandria represented the pinnacle of scholarly achievement in the ancient world. Founded in the 3rd century BCE, it served as a beacon of learning and intellectual pursuit.</p><h3>Architecture and Organization</h3><p>The Great Library was part of a larger scholarly institution known as the Mouseion...</p>',
    excerpt: 'Discover the fascinating history of ancient libraries and their role',
    featured_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category_id: 2,
    category_name: 'History',
    category_slug: 'history',
    category: { id: 2, name: 'History', slug: 'history' },
    tags: ['history', 'libraries', 'ancient', 'knowledge', 'preservation'],
    meta_title: 'Ancient Libraries: Guardians of Knowledge',
    meta_description: 'Discover the fascinating history of ancient libraries',
    is_featured: true,
    status: 'published',
    view_count: 156,
    created_at: '2024-01-05 09:15:00',
    updated_at: '2024-01-05 09:15:00'
  }
];

const testRelatedBooks = {
  1: [
    { id: 1, title: 'The Library Book', author: 'Susan Orlean', description: 'A fascinating exploration of libraries and their cultural significance', price: '$14.99', purchase_link: 'https://www.amazon.com/Library-Book-Susan-Orlean/dp/1476740186' },
    { id: 2, title: 'The Name of the Rose', author: 'Umberto Eco', description: 'A mystery set in a medieval monastery library', price: '$15.95', purchase_link: 'https://www.amazon.com/Name-Rose-Umberto-Eco/dp/0544176561' }
  ],
  2: [
    { id: 3, title: 'The Lord of the Rings', author: 'J.R.R. Tolkien', description: 'The epic fantasy that defined the genre', price: '$18.99', purchase_link: 'https://www.amazon.com/Lord-Rings-J-R-R-Tolkien/dp/0544003411' },
    { id: 4, title: 'The Name of the Wind', author: 'Patrick Rothfuss', description: 'Modern fantasy at its finest', price: '$16.99', purchase_link: 'https://www.amazon.com/Name-Wind-Patrick-Rothfuss/dp/0756404746' }
  ],
  3: [
    { id: 5, title: 'The Library of Alexandria', author: 'Roy MacLeod', description: 'Comprehensive history of the ancient world\'s greatest library', price: '$29.99', purchase_link: 'https://www.amazon.com/Library-Alexandria-Roy-MacLeod/dp/1860646549' }
  ]
};

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://5173-iqlf46n8u7cb20rncfecy-6532622b.e2b.dev',
    /https:\/\/\d+-.*\.e2b\.dev$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.get('/api/blogs', (req, res) => {
  const { search, status, page = 1, limit = 10, category, tag, featured } = req.query;
  
  let blogs = [...testBlogs];
  
  // Filter by search
  if (search) {
    blogs = blogs.filter(blog => 
      blog.title.toLowerCase().includes(search.toLowerCase()) ||
      blog.content.toLowerCase().includes(search.toLowerCase()) ||
      blog.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    );
  }
  
  // Filter by category
  if (category) {
    blogs = blogs.filter(blog => blog.category_slug === category);
  }
  
  // Filter by tag
  if (tag) {
    blogs = blogs.filter(blog => blog.tags.includes(tag));
  }
  
  // Filter by featured
  if (featured !== undefined) {
    blogs = blogs.filter(blog => blog.is_featured === (featured === 'true'));
  }
  
  const total = blogs.length;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;
  
  // Pagination
  blogs = blogs.slice(offset, offset + limitNum);
  
  // Add related books
  blogs = blogs.map(blog => ({
    ...blog,
    related_books: testRelatedBooks[blog.id] || []
  }));
  
  res.json({
    blogs,
    total,
    page: pageNum,
    limit: limitNum,
    total_pages: Math.ceil(total / limitNum)
  });
});

app.get('/api/blogs/:id', (req, res) => {
  const { id } = req.params;
  const blog = testBlogs.find(b => b.id === parseInt(id));
  
  if (!blog) {
    return res.status(404).json({ error: 'Blog not found' });
  }
  
  // Add related books
  const blogWithBooks = {
    ...blog,
    related_books: testRelatedBooks[blog.id] || []
  };
  
  res.json({ blog: blogWithBooks });
});

app.get('/api/blogs/slug/:slug', (req, res) => {
  const { slug } = req.params;
  const blog = testBlogs.find(b => b.slug === slug);
  
  if (!blog) {
    return res.status(404).json({ error: 'Blog not found' });
  }
  
  // Add related books
  const blogWithBooks = {
    ...blog,
    related_books: testRelatedBooks[blog.id] || []
  };
  
  res.json({ blog: blogWithBooks });
});

app.get('/api/categories', (req, res) => {
  res.json({ categories: testCategories });
});

app.get('/api/banner', (req, res) => {
  const banners = [
    {
      id: 1,
      title: 'Building Your Personal Library',
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      link: '/blog/building-personal-library-complete-guide'
    },
    {
      id: 2,
      title: 'Ancient Libraries',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      link: '/blog/ancient-libraries-guardians-knowledge'
    }
  ];
  
  res.json({ banners });
});

// Start the server
function startNodeServer() {
  console.log('🚀 Starting Node.js backend server...');
  
  const server = app.listen(PORT, HOST, () => {
    console.log(`🌐 Backend server started on http://${HOST}:${PORT}`);
    console.log('📋 Available API endpoints:');
    console.log('   - GET /api/blogs - List all blogs');
    console.log('   - GET /api/blogs/{id} - Get blog by ID');
    console.log('   - GET /api/blogs/slug/{slug} - Get blog by slug');
    console.log('   - GET /api/categories - List all categories');
    console.log('   - GET /api/banner - Get banner images');
    console.log('\n✅ Server is ready to handle requests');
  });
  
  // Handle server errors
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use`);
    } else {
      console.error('❌ Server error:', error.message);
    }
    process.exit(1);
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down backend server...');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down backend server...');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });
}

// Start the server
startNodeServer();