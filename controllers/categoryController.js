const Category = require('../models/Category');

// @route   POST /api/categories (admin)
exports.createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/categories (public - active only)
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ status: 'active' }).sort('name');
    res.json({ success: true, count: categories.length, categories });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/categories/all (admin)
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort('name');
    res.json({ success: true, count: categories.length, categories });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/categories/:id (admin)
exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/categories/:id (admin)
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};
