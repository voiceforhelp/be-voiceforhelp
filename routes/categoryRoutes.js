const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createCategory,
  getCategories,
  getAllCategories,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

router.get('/', getCategories);
router.get('/all', protect, authorize('admin'), getAllCategories);
router.post('/', protect, authorize('admin'), createCategory);
router.put('/:id', protect, authorize('admin'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

module.exports = router;
