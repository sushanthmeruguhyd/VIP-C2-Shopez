import express from 'express';
import Admin from '../models/Admin.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get admin configurations (categories, banner)
// @route   GET /api/admin/config
// @access  Public
router.get('/config', async (req, res, next) => {
  try {
    let config = await Admin.findOne();

    if (!config) {
      // Create a default if none exists
      config = await Admin.create({
        bannerImage: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1200&auto=format&fit=crop',
        categories: ['Laptops', 'Audio', 'Wearables', 'Phones', 'Accessories'],
      });
    }

    res.json(config);
  } catch (error) {
    next(error);
  }
});

// @desc    Update admin configurations
// @route   PUT /api/admin/config
// @access  Private/Admin
router.put('/config', protect, adminOnly, async (req, res, next) => {
  try {
    const { bannerImage, categories } = req.body;

    let config = await Admin.findOne();

    if (!config) {
      config = new Admin({
        bannerImage,
        categories,
      });
    } else {
      config.bannerImage = bannerImage !== undefined ? bannerImage : config.bannerImage;
      config.categories = categories !== undefined ? categories : config.categories;
    }

    const updatedConfig = await config.save();
    res.json(updatedConfig);
  } catch (error) {
    next(error);
  }
});

export default router;
