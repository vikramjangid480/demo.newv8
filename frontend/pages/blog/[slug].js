import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { Calendar, Eye, Tag, ExternalLink, ChevronRight, Share2, Twitter, Facebook, Linkedin, MessageSquare, Copy, Clock, ThumbsUp, ThumbsDown } from 'lucide-react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { blogAPI, utils } from '../../utils/api'

// Use SSR for blog posts to avoid build issues
export async function getServerSideProps({ params }) {
  const { slug } = params
  
  try {
    console.log('Fetching blog with slug:', slug)
    const response = await blogAPI.getBlogBySlug(slug)
    
    console.log('API Response:', response)
    
    if (response && response.blog) {
      console.log('Blog data found:', response.blog)
      return {
        props: {
          initialBlog: response.blog,
          relatedArticles: []
        }
      }
    } else {
      const errorMsg = 'Failed to load blog post';
      console.error(errorMsg, response)
      return {
        props: {
          error: errorMsg,
          initialBlog: null,
          relatedArticles: []
        }
      }
    }
  } catch (error) {
    console.error('Error fetching blog:', error)
    const errorMsg = error.response?.data?.error || error.message || 'Failed to load blog post';
    
    return {
      props: {
        error: errorMsg,
        initialBlog: null,
        relatedArticles: []
      }
    }
  }
}

// BlogDetailPage component definition starts here
function BlogDetailPage({ initialBlog = null, relatedArticles = [] }) {
  const router = useRouter()
  const { slug } = router.query
  const [blog, setBlog] = useState(initialBlog)
  const [relatedBooks, setRelatedBooks] = useState([])
  const [loading, setLoading] = useState(!initialBlog)
  const [error, setError] = useState(null)
  const [tableOfContents, setTableOfContents] = useState([])
  const [showMoreRelated, setShowMoreRelated] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    if (!initialBlog && slug) {
      fetchBlogDetail()
    }
  }, [slug, initialBlog])

  useEffect(() => {
    if (blog) {
      generateTableOfContents()
    }
  }, [blog])

  const fetchBlogDetail = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await blogAPI.getBlogBySlug(slug)
      setBlog(response.blog)
      if (response.blog && Array.isArray(response.blog.related_books)) {
        setRelatedBooks(response.blog.related_books)
      } else {
        setRelatedBooks([])
      }
    } catch (err) {
      if (err.status === 404) {
        setError('Blog post not found')
      } else {
        setError('Failed to load blog post. Please try again.')
      }
      setLoading(false)
    }
  }

  const generateTableOfContents = () => {
    if (!blog || !blog.content) return

    // Extract h2 and h3 tags from content
    const headingRegex = /<h([23])[^>]*>(.*?)<\/h[23]>/gi
    const headings = []
    let match

    while ((match = headingRegex.exec(blog.content)) !== null) {
      const level = parseInt(match[1])
      const text = match[2].replace(/<[^>]*>/g, '') // Remove any HTML tags
      const id = utils.generateSlug(text)
      
      headings.push({
        level,
        text,
        id
      })
    }

    setTableOfContents(headings)
  }

  const scrollToHeading = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleTagClick = (tag) => {
    router.push(`/tag/${encodeURIComponent(tag.trim())}`)
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareTitle = blog ? blog.title : ''

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const handleFeedback = (type) => {
    setFeedback(type)
    // You can implement API call to save feedback here
  }

  // Process content to add IDs to headings
  const processContent = (content) => {
    return content.replace(/<h([23])[^>]*>(.*?)<\/h[23]>/gi, (match, level, text) => {
      const cleanText = text.replace(/<[^>]*>/g, '')
      const id = utils.generateSlug(cleanText)
      return `<h${level} id="${id}" class="scroll-mt-24">${text}</h${level}>`
    })
  }

  const calculateReadTime = (content) => {
    const wordsPerMinute = 200
    const words = content?.replace(/<[^>]*>/g, '').split(' ').length || 0
    return Math.ceil(words / wordsPerMinute)
  }

  // Display only 3 related articles by default
  const displayedRelatedArticles = showMoreRelated ? relatedArticles : relatedArticles?.slice(0, 3) || []

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading... - Boganto</title>
        </Head>
        <Header />
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded mb-6"></div>
              <div className="space-y-4">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Error - Boganto</title>
        </Head>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-navy-800 mb-4">{error}</h2>
            <p className="text-navy-600 mb-6">The blog post you're looking for might have been moved or deleted.</p>
            <Link href="/" className="btn-primary">
              Back to Home
            </Link>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (!blog) {
    return null
  }

  const defaultImage = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
  const readTime = calculateReadTime(blog.content)

  return (
    <>
      <Head>
        <title>{blog.title} - Boganto</title>
        <meta name="description" content={blog.excerpt || blog.title} />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.excerpt || blog.title} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={blog.featured_image || defaultImage} />
        <meta property="article:published_time" content={blog.created_at} />
        <meta property="article:author" content="Boganto" />
        {blog.tags && blog.tags.map((tag, index) => (
          <meta key={index} property="article:tag" content={tag.trim()} />
        ))}
        <link rel="canonical" href={`https://boganto.com/blog/${blog.slug}`} />
      </Head>

      <Header />
      <main>
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center space-x-2 text-sm text-navy-500">
              <Link href="/" className="hover:text-primary-500">Home</Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/" className="hover:text-primary-500">Blog</Link>
              {blog.category && (
                <>
                  <ChevronRight className="h-4 w-4" />
                  <Link 
                    href={`/category/${blog.category.slug}`} 
                    className="hover:text-primary-500"
                  >
                    {blog.category.name}
                  </Link>
                </>
              )}
              <ChevronRight className="h-4 w-4" />
              <span className="text-navy-700 font-medium truncate">{blog.title}</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-white py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Category Tag */}
            {blog.category && (
              <div className="mb-6">
                <Link href={`/category/${blog.category.slug}`}>
                  <span className="bg-primary-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-600 transition-colors duration-200">
                    {blog.category.name}
                  </span>
                </Link>
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-navy-800 mb-8 leading-tight">
              {blog.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-navy-600 mb-8">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{utils.formatDate(blog.created_at)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>{readTime} min read</span>
              </div>
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                <span>{blog.view_count || 0} views</span>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Images Section */}
        <section className="py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <img
                src={blog.featured_image || defaultImage}
                alt={blog.title}
                onError={(e) => {
                  if (e.target.src !== defaultImage) {
                    e.target.src = defaultImage
                  }
                }}
                
              />
              <img
                src={blog.featured_image_2 || blog.featured_image || defaultImage}
                alt={`${blog.title} - Image 2`}
                className="w-full h-64 md:h-80 object-cover rounded-xl shadow-lg"
                onError={(e) => {
                  e.target.src = defaultImage
                }}
              />
            </div>
          </div>
        </section>

        {/* Main Content with Sidebar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Sidebar - Table of Contents */}
            <aside className="lg:col-span-3 order-2 lg:order-1">
              <div className="sticky top-24">
                {tableOfContents.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-navy-800 mb-4">Table of Contents</h3>
                    <nav className="space-y-2">
                      {tableOfContents.map((heading, index) => (
                        <button
                          key={index}
                          onClick={() => scrollToHeading(heading.id)}
                          className={`block w-full text-left text-sm hover:text-primary-600 transition-colors duration-200 ${
                            heading.level === 2 
                              ? 'font-medium text-navy-700' 
                              : 'pl-4 text-navy-600'
                          }`}
                        >
                          {heading.text}
                        </button>
                      ))}
                    </nav>
                  </div>
                )}
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-6 order-1 lg:order-2">
              <article className="bg-white rounded-xl shadow-lg p-8">
                <div 
                  className="article-content prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: processContent(blog.content) }}
                />

                {/* Tags */}
                {blog.tags && blog.tags.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <h4 className="text-lg font-semibold text-navy-800 mb-4">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {blog.tags.map((tag, index) => (
                        <button
                          key={index}
                          onClick={() => handleTagClick(tag)}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors duration-200"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag.trim()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Share Buttons */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h4 className="text-lg font-semibold text-navy-800 mb-4">Share this article</h4>
                  <div className="flex items-center space-x-4">
                    <a
                      href={shareLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      <Facebook className="h-4 w-4 mr-2" />
                      Facebook
                    </a>
                    <a
                      href={shareLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors duration-200"
                    >
                      <Twitter className="h-4 w-4 mr-2" />
                      Twitter
                    </a>
                    <a
                      href={shareLinks.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      WhatsApp
                    </a>
                    <button
                      onClick={copyToClipboard}
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
                        copySuccess 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-600 text-white hover:bg-gray-700'
                      }`}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {copySuccess ? 'Copied!' : 'Copy Link'}
                    </button>
                  </div>
                </div>
              </article>
            </main>

            {/* Right Sidebar - Related Books */}
            <aside className="lg:col-span-3 order-3">
              <div className="sticky top-24">
                {relatedBooks.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-navy-800 mb-6">Related Books</h3>
                    <div className="space-y-6">
                      {relatedBooks.map((book) => (
                        <div key={book.id} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                          <h4 className="font-semibold text-navy-800 mb-2 text-sm leading-tight">
                            {book.title}
                          </h4>
                          {book.description && (
                            <p className="text-navy-600 text-xs mb-3 leading-relaxed">
                              {book.description}
                            </p>
                          )}
                          {book.price && (
                            <p className="text-primary-600 font-bold mb-3 text-sm">{book.price}</p>
                          )}
                          <a
                            href={book.purchase_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-primary-500 hover:text-primary-600 font-medium text-sm transition-colors duration-200 group"
                          >
                            Purchase Book
                            <ExternalLink className="ml-1 h-3 w-3 group-hover:scale-110 transition-transform duration-200" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>

        {/* Related Articles Section */}
        {relatedArticles && relatedArticles.length > 0 && (
          <section className="bg-gray-50 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-navy-800 mb-12 text-center">Related Articles</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayedRelatedArticles.map((article) => (
                  <article key={article.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    <Link href={`/blog/${article.slug}`}>
                      <div className="aspect-video relative">
                        <img
                          src={article.featured_image || defaultImage}
                          alt={article.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = defaultImage
                          }}
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-navy-800 mb-3 line-clamp-2 hover:text-primary-600 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-navy-600 text-sm mb-4 line-clamp-3">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center text-xs text-navy-400">
                          <Calendar className="h-3   w-3 mr-1" />
                          <span>{utils.formatDate(article.created_at)}</span>
                          <span className="mx-2">•</span>
                          <Eye className="h-3 w-3 mr-1" />
                          <span>{article.view_count || 0} views</span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>

              {relatedArticles.length > 3 && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => setShowMoreRelated(!showMoreRelated)}
                    className="btn-secondary"
                  >
                    {showMoreRelated ? 'See Less' : 'See More'}
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Feedback Section */}
        <section className="py-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-2xl font-bold text-navy-800 mb-6">Was this article helpful?</h3>
            
            {feedback ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <p className="text-green-800 font-medium">
                  Thank you for your feedback! 
                  {feedback === 'yes' ? ' We\'re glad you found it helpful.' : ' We\'ll work on improving our content.'}
                </p>
              </div>
            ) : (
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => handleFeedback('yes')}
                  className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  <ThumbsUp className="h-5 w-5 mr-2" />
                  Yes, it was helpful
                </button>
                <button
                  onClick={() => handleFeedback('no')}
                  className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  <ThumbsDown className="h-5 w-5 mr-2" />
                  No, it wasn't helpful
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default BlogDetailPage