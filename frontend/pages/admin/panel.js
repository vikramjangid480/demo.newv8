import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import { 
  Menu, 
  Home, 
  FileText, 
  Settings, 
  Users, 
  Tags,
  Image,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const AdminPanel = () => {
  const { user, logout } = useAuth()
  const router = useRouter()

  // Navigation state
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState('dashboard')

  // Blog management state
  const [blogs, setBlogs] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingBlog, setEditingBlog] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category_id: '',
    tags: '',
    meta_title: '',
    meta_description: '',
    status: 'draft',
    is_featured: false,
    featured_image: null,
    related_books: []
  })

  // Related books state
  const [relatedBooks, setRelatedBooks] = useState([])

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/admin')
    }
  }, [user, router])

  // Load initial data
  useEffect(() => {
    if (user) {
      fetchCategories()
      if (activeSection === 'blogs') {
        fetchBlogs()
      }
    }
  }, [user, activeSection, currentPage, searchTerm, statusFilter])

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories', {
        withCredentials: true
      })
      setCategories(response.data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      showToast('Failed to load categories', 'error')
    }
  }

  const fetchBlogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter === 'all' ? '' : statusFilter
      })

      const response = await axios.get(`/api/blogs?${params}`, {
        withCredentials: true
      })
      setBlogs(response.data.blogs || [])
      setTotalPages(Math.ceil((response.data.total || 0) / 10))
    } catch (error) {
      console.error('Error fetching blogs:', error)
      showToast('Failed to load blogs', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/admin')
  }

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      category_id: '',
      tags: '',
      meta_title: '',
      meta_description: '',
      status: 'draft',
      is_featured: false,
      featured_image: null,
      related_books: []
    })
    setRelatedBooks([])
    setEditingBlog(null)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target
    
    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }))
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
      
      // Auto-generate slug from title
      if (name === 'title' && value) {
        const slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
        setFormData(prev => ({ ...prev, slug }))
      }
    }
  }

  const addRelatedBook = () => {
    setRelatedBooks([...relatedBooks, { title: '', author: '', purchase_link: '' }])
  }

  const updateRelatedBook = (index, field, value) => {
    const updated = [...relatedBooks]
    updated[index] = { ...updated[index], [field]: value }
    setRelatedBooks(updated)
  }

  const removeRelatedBook = (index) => {
    setRelatedBooks(relatedBooks.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formPayload = new FormData()
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'featured_image' && formData[key]) {
          formPayload.append(key, formData[key])
        } else if (key !== 'featured_image' && key !== 'related_books') {
          formPayload.append(key, formData[key])
        }
      })

      // Add related books
      if (relatedBooks.length > 0) {
        formPayload.append('related_books', JSON.stringify(relatedBooks))
      }

      let response
      if (editingBlog) {
        // Update existing blog
        formPayload.append('id', editingBlog.id)
        response = await axios.put('/api/admin/blogs', formPayload, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        })
      } else {
        // Create new blog
        response = await axios.post('/api/admin/blogs', formPayload, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        })
      }

      showToast(editingBlog ? 'Blog updated successfully!' : 'Blog created successfully!')
      resetForm()
      setShowForm(false)
      fetchBlogs()
      
    } catch (error) {
      console.error('Error saving blog:', error)
      showToast(error.response?.data?.error || 'Failed to save blog', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (blog) => {
    setEditingBlog(blog)
    setFormData({
      title: blog.title || '',
      slug: blog.slug || '',
      content: blog.content || '',
      excerpt: blog.excerpt || '',
      category_id: blog.category_id || '',
      tags: blog.tags || '',
      meta_title: blog.meta_title || '',
      meta_description: blog.meta_description || '',
      status: blog.status || 'draft',
      is_featured: blog.is_featured || false,
      featured_image: null,
      related_books: []
    })
    
    // Load related books for editing
    if (blog.related_books) {
      setRelatedBooks(blog.related_books)
    }
    
    setShowForm(true)
  }

  const handleDelete = async (blogId) => {
    if (!confirm('Are you sure you want to delete this blog?')) return

    try {
      await axios.delete(`/api/admin/blogs?id=${blogId}`, {
        withCredentials: true
      })
      showToast('Blog deleted successfully!')
      fetchBlogs()
    } catch (error) {
      console.error('Error deleting blog:', error)
      showToast('Failed to delete blog', 'error')
    }
  }

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'blogs', label: 'Blog Management', icon: FileText },
    { id: 'categories', label: 'Categories', icon: Tags },
    { id: 'media', label: 'Media Library', icon: Image },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  if (!user) {
    return (
      <>
        <Head>
          <title>Loading... - Admin Panel</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Admin Panel - Boganto</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <div className={`bg-white shadow-lg transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                {sidebarOpen && (
                  <div className="ml-3">
                    <h1 className="text-lg font-bold text-slate-800">Boganto</h1>
                    <p className="text-xs text-slate-500">Admin Panel</p>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {sidebarItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                          activeSection === item.id
                            ? 'bg-orange-100 text-orange-600 border border-orange-200'
                            : 'text-slate-600 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {sidebarOpen && <span className="ml-3 text-sm font-medium">{item.label}</span>}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <header className="bg-white shadow-sm border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-slate-800 capitalize">
                    {activeSection === 'blogs' ? 'Blog Management' : activeSection}
                  </h1>
                  <p className="text-sm text-slate-500">
                    {activeSection === 'dashboard' && 'Overview of your blog statistics'}
                    {activeSection === 'blogs' && 'Create, edit, and manage your blog posts'}
                    {activeSection === 'categories' && 'Manage blog categories'}
                    {activeSection === 'media' && 'Upload and manage media files'}
                    {activeSection === 'users' && 'Manage admin users'}
                    {activeSection === 'settings' && 'Configure blog settings'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm text-slate-600">
                  Welcome, <span className="font-medium">{user?.email || 'Admin'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 p-6">
            {/* Dashboard Section */}
            {activeSection === 'dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Total Blogs</p>
                      <p className="text-2xl font-bold text-slate-800">{blogs.length}</p>
                    </div>
                    <FileText className="w-8 h-8 text-orange-500" />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Published</p>
                      <p className="text-2xl font-bold text-green-600">
                        {blogs.filter(b => b.status === 'published').length}
                      </p>
                    </div>
                    <Eye className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Drafts</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {blogs.filter(b => b.status === 'draft').length}
                      </p>
                    </div>
                    <Edit className="w-8 h-8 text-yellow-500" />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Categories</p>
                      <p className="text-2xl font-bold text-blue-600">{categories.length}</p>
                    </div>
                    <Tags className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
              </div>
            )}

            {/* Blog Management Section */}
            {activeSection === 'blogs' && (
              <div className="space-y-6">
                {!showForm ? (
                  <>
                    {/* Blog List Header */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="relative">
                            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Search blogs..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                          </div>
                          <div className="relative">
                            <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <select
                              value={statusFilter}
                              onChange={(e) => setStatusFilter(e.target.value)}
                              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            >
                              <option value="all">All Status</option>
                              <option value="published">Published</option>
                              <option value="draft">Draft</option>
                              <option value="archived">Archived</option>
                            </select>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => setShowForm(true)}
                          className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Create New Blog</span>
                        </button>
                      </div>
                    </div>

                    {/* Blog List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      {loading ? (
                        <div className="p-8 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                          <p className="text-slate-600">Loading blogs...</p>
                        </div>
                      ) : (
                        <>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Title
                                  </th>
                                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                  </th>
                                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                  </th>
                                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Featured
                                  </th>
                                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created
                                  </th>
                                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {blogs.map((blog) => (
                                  <tr key={blog.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                      <div>
                                        <p className="font-medium text-slate-800 truncate max-w-xs">
                                          {blog.title}
                                        </p>
                                        <p className="text-sm text-slate-500 truncate max-w-xs">
                                          {blog.excerpt}
                                        </p>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {blog.category_name || 'Uncategorized'}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        blog.status === 'published' 
                                          ? 'bg-green-100 text-green-800'
                                          : blog.status === 'draft'
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : 'bg-gray-100 text-gray-800'
                                      }`}>
                                        {blog.status}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        blog.is_featured 
                                          ? 'bg-orange-100 text-orange-800' 
                                          : 'bg-gray-100 text-gray-800'
                                      }`}>
                                        {blog.is_featured ? 'Yes' : 'No'}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                      {new Date(blog.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex space-x-2">
                                        <button
                                          onClick={() => window.open(`/blog/${blog.slug}`, '_blank')}
                                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                        >
                                          <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => handleEdit(blog)}
                                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                                        >
                                          <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => handleDelete(blog.id)}
                                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Pagination */}
                          {totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                              <div className="text-sm text-slate-600">
                                Page {currentPage} of {totalPages}
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                  disabled={currentPage === 1}
                                  className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                  disabled={currentPage === totalPages}
                                  className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  /* Blog Form */
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-slate-800">
                        {editingBlog ? 'Edit Blog' : 'Create New Blog'}
                      </h2>
                      <button
                        onClick={() => {
                          setShowForm(false)
                          resetForm()
                        }}
                        className="px-4 py-2 text-slate-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Title and Slug */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Title *
                          </label>
                          <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Slug (URL)
                          </label>
                          <input
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                      </div>

                      {/* Content */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Content *
                        </label>
                        <textarea
                          name="content"
                          value={formData.content}
                          onChange={handleInputChange}
                          required
                          rows={10}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Write your blog content here..."
                        />
                      </div>

                      {/* Category and Tags */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Category *
                          </label>
                          <select
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          >
                            <option value="">Select a category</option>
                            {categories.map(category => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Tags (comma separated)
                          </label>
                          <input
                            type="text"
                            name="tags"
                            value={formData.tags}
                            onChange={handleInputChange}
                            placeholder="tag1, tag2, tag3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                      </div>

                      {/* Featured Image */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Featured Image
                        </label>
                        <input
                          type="file"
                          name="featured_image"
                          accept="image/*"
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>

                      {/* Excerpt */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Excerpt
                        </label>
                        <textarea
                          name="excerpt"
                          value={formData.excerpt}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Brief description of the blog post..."
                        />
                      </div>

                      {/* Related Books */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <label className="block text-sm font-medium text-slate-700">
                            Related Books
                          </label>
                          <button
                            type="button"
                            onClick={addRelatedBook}
                            className="flex items-center space-x-2 px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add Book</span>
                          </button>
                        </div>
                        
                        {relatedBooks.map((book, index) => (
                          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg mb-4">
                            <div>
                              <input
                                type="text"
                                placeholder="Book title"
                                value={book.title}
                                onChange={(e) => updateRelatedBook(index, 'title', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              />
                            </div>
                            <div>
                              <input
                                type="text"
                                placeholder="Author name"
                                value={book.author}
                                onChange={(e) => updateRelatedBook(index, 'author', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              />
                            </div>
                            <div className="flex space-x-2">
                              <input
                                type="url"
                                placeholder="Purchase link"
                                value={book.purchase_link}
                                onChange={(e) => updateRelatedBook(index, 'purchase_link', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              />
                              <button
                                type="button"
                                onClick={() => removeRelatedBook(index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* SEO Fields */}
                      <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-medium text-slate-800 mb-4">SEO Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Meta Title
                            </label>
                            <input
                              type="text"
                              name="meta_title"
                              value={formData.meta_title}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Meta Description
                            </label>
                            <textarea
                              name="meta_description"
                              value={formData.meta_description}
                              onChange={handleInputChange}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Status and Featured */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-200 pt-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Status
                          </label>
                          <select
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                          </select>
                        </div>
                        <div className="flex items-center mt-8">
                          <input
                            type="checkbox"
                            name="is_featured"
                            checked={formData.is_featured}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                          />
                          <label className="ml-2 text-sm font-medium text-slate-700">
                            Featured Article
                          </label>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="flex justify-end space-x-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowForm(false)
                            resetForm()
                          }}
                          className="px-6 py-2 border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                          <span>{editingBlog ? 'Update Blog' : 'Create Blog'}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* Other Sections Placeholder */}
            {['categories', 'media', 'users', 'settings'].includes(activeSection) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-800 mb-2 capitalize">
                  {activeSection} Management
                </h3>
                <p className="text-slate-600">
                  This section is under development. Coming soon!
                </p>
              </div>
            )}
          </main>
        </div>

        {/* Toast Notification */}
        {toast.show && (
          <div className="fixed top-4 right-4 z-50">
            <div className={`px-6 py-4 rounded-lg shadow-lg ${
              toast.type === 'success' 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              {toast.message}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default AdminPanel