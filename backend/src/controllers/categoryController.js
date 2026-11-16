import Category from '../models/Category.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// @desc    Get all categories with subcategories and topics
// @route   GET /api/categories
// @access  Public / Private
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    return sendSuccess(res, 200, 'Categories retrieved', categories);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (Teacher or Admin)
export const createCategory = async (req, res, next) => {
  try {
    const { name, subcategories = [] } = req.body;
    if (!name || name.trim() === '') {
      return sendError(res, 400, 'Category name is required');
    }

    const exists = await Category.findOne({ name: name.trim() });
    if (exists) {
      return sendError(res, 400, 'Category already exists');
    }

    const category = await Category.create({
      name: name.trim(),
      subcategories,
    });

    return sendSuccess(res, 201, 'Category created', category);
  } catch (error) {
    next(error);
  }
};

// @desc    Add subcategory to existing category
// @route   POST /api/categories/:id/subcategories
// @access  Private (Teacher or Admin)
export const addSubcategory = async (req, res, next) => {
  try {
    const { name, topics = [] } = req.body;
    if (!name || name.trim() === '') {
      return sendError(res, 400, 'Subcategory name is required');
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return sendError(res, 404, 'Category not found');
    }

    const subExists = category.subcategories.some(
      (s) => s.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (subExists) {
      return sendError(res, 400, 'Subcategory already exists in this category');
    }

    category.subcategories.push({ name: name.trim(), topics });
    await category.save();

    return sendSuccess(res, 201, 'Subcategory added', category);
  } catch (error) {
    next(error);
  }
};

// @desc    Add topic to a subcategory
// @route   PATCH /api/categories/:id/subcategories/:subId/topics
// @access  Private (Teacher or Admin)
export const addTopic = async (req, res, next) => {
  try {
    const { topic } = req.body;
    if (!topic || topic.trim() === '') {
      return sendError(res, 400, 'Topic is required');
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return sendError(res, 404, 'Category not found');
    }

    const subcategory = category.subcategories.id(req.params.subId);
    if (!subcategory) {
      return sendError(res, 404, 'Subcategory not found');
    }

    if (!subcategory.topics.includes(topic.trim())) {
      subcategory.topics.push(topic.trim());
      await category.save();
    }

    return sendSuccess(res, 200, 'Topic added', category);
  } catch (error) {
    next(error);
  }
};
