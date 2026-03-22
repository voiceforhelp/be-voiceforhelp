const express = require('express');
const router = express.Router();
const {
  getBlogs,
  getBlogBySlug,
  getPopularBlogs,
  getRecentBlogs,
  getAdminBlogs,
  getAdminBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} = require('../controllers/blogController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getBlogs);
router.get('/popular', getPopularBlogs);
router.get('/recent', getRecentBlogs);
router.get('/slug/:slug', getBlogBySlug);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAdminBlogs);
router.get('/admin/:id', protect, authorize('admin'), getAdminBlogById);
router.post('/', protect, authorize('admin'), createBlog);
router.put('/:id', protect, authorize('admin'), updateBlog);
router.delete('/:id', protect, authorize('admin'), deleteBlog);

module.exports = router;
