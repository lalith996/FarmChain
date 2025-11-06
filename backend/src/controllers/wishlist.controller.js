const Wishlist = require('../models/Wishlist.model');
const Product = require('../models/Product.model');

/**
 * Get all wishlists for authenticated user
 */
exports.getWishlists = async (req, res) => {
  try {
    const wishlists = await Wishlist.find({ userId: req.user._id })
      .populate({
        path: 'items.productId',
        select: 'name price images category stock farmer',
        populate: {
          path: 'farmer',
          select: 'profile.name verification.isVerified'
        }
      })
      .sort({ isDefault: -1, createdAt: -1 });

    res.json({ 
      success: true, 
      data: wishlists,
      count: wishlists.length
    });
  } catch (error) {
    console.error('Error fetching wishlists:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch wishlists' 
    });
  }
};

/**
 * Get single wishlist by ID
 */
exports.getWishlistById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const wishlist = await Wishlist.findOne({ 
      _id: id, 
      userId: req.user._id 
    }).populate({
      path: 'items.productId',
      populate: {
        path: 'farmer',
        select: 'profile.name verification.isVerified'
      }
    });

    if (!wishlist) {
      return res.status(404).json({ 
        success: false, 
        error: 'Wishlist not found' 
      });
    }

    res.json({ success: true, data: wishlist });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch wishlist' 
    });
  }
};

/**
 * Create new wishlist
 */
exports.createWishlist = async (req, res) => {
  try {
    const { name, isPublic } = req.body;

    // Validate name
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Wishlist name is required' 
      });
    }

    const wishlist = await Wishlist.create({
      userId: req.user._id,
      name: name.trim(),
      isPublic: isPublic || false,
      isDefault: false
    });

    res.status(201).json({ 
      success: true, 
      data: wishlist,
      message: 'Wishlist created successfully'
    });
  } catch (error) {
    console.error('Error creating wishlist:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create wishlist' 
    });
  }
};

/**
 * Add product to wishlist
 */
exports.addToWishlist = async (req, res) => {
  try {
    const { productId, wishlistId, notes, notifyOnPriceDrop, notifyOnStock } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: 'Product not found' 
      });
    }

    let wishlist;
    
    if (wishlistId) {
      // Add to specific wishlist
      wishlist = await Wishlist.findOne({ 
        _id: wishlistId, 
        userId: req.user._id 
      });
      
      if (!wishlist) {
        return res.status(404).json({ 
          success: false, 
          error: 'Wishlist not found' 
        });
      }
    } else {
      // Get or create default wishlist
      wishlist = await Wishlist.findOne({ 
        userId: req.user._id, 
        isDefault: true 
      });
      
      if (!wishlist) {
        wishlist = await Wishlist.create({
          userId: req.user._id,
          name: 'My Wishlist',
          isDefault: true
        });
      }
    }

    // Check if product already in wishlist
    if (wishlist.hasProduct(productId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Product already in wishlist' 
      });
    }

    // Add product
    wishlist.items.push({
      productId,
      priceWhenAdded: product.price,
      notes: notes || '',
      notifyOnPriceDrop: notifyOnPriceDrop || false,
      notifyOnStock: notifyOnStock || false
    });

    await wishlist.save();
    await wishlist.populate({
      path: 'items.productId',
      populate: {
        path: 'farmer',
        select: 'profile.name verification.isVerified'
      }
    });

    res.json({ 
      success: true, 
      data: wishlist,
      message: 'Product added to wishlist'
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to add product to wishlist' 
    });
  }
};

/**
 * Remove product from wishlist
 */
exports.removeFromWishlist = async (req, res) => {
  try {
    const { wishlistId, productId } = req.params;

    const wishlist = await Wishlist.findOne({ 
      _id: wishlistId, 
      userId: req.user._id 
    });

    if (!wishlist) {
      return res.status(404).json({ 
        success: false, 
        error: 'Wishlist not found' 
      });
    }

    // Remove product
    wishlist.removeProduct(productId);
    await wishlist.save();

    res.json({ 
      success: true, 
      data: wishlist,
      message: 'Product removed from wishlist'
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to remove product from wishlist' 
    });
  }
};

/**
 * Update wishlist settings
 */
exports.updateWishlist = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isPublic } = req.body;

    const wishlist = await Wishlist.findOne({ 
      _id: id, 
      userId: req.user._id 
    });

    if (!wishlist) {
      return res.status(404).json({ 
        success: false, 
        error: 'Wishlist not found' 
      });
    }

    if (name) wishlist.name = name.trim();
    if (typeof isPublic !== 'undefined') wishlist.isPublic = isPublic;

    await wishlist.save();

    res.json({ 
      success: true, 
      data: wishlist,
      message: 'Wishlist updated successfully'
    });
  } catch (error) {
    console.error('Error updating wishlist:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update wishlist' 
    });
  }
};

/**
 * Delete wishlist
 */
exports.deleteWishlist = async (req, res) => {
  try {
    const { id } = req.params;

    const wishlist = await Wishlist.findOne({ 
      _id: id, 
      userId: req.user._id 
    });

    if (!wishlist) {
      return res.status(404).json({ 
        success: false, 
        error: 'Wishlist not found' 
      });
    }

    // Prevent deletion of default wishlist
    if (wishlist.isDefault) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot delete default wishlist' 
      });
    }

    await wishlist.deleteOne();

    res.json({ 
      success: true, 
      message: 'Wishlist deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting wishlist:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete wishlist' 
    });
  }
};

/**
 * Get public wishlist by share token
 */
exports.getPublicWishlist = async (req, res) => {
  try {
    const { token } = req.params;

    const wishlist = await Wishlist.findOne({ 
      shareToken: token,
      isPublic: true 
    }).populate({
      path: 'items.productId',
      populate: {
        path: 'farmer',
        select: 'profile.name verification.isVerified'
      }
    }).populate('userId', 'profile.name');

    if (!wishlist) {
      return res.status(404).json({ 
        success: false, 
        error: 'Wishlist not found or not public' 
      });
    }

    res.json({ success: true, data: wishlist });
  } catch (error) {
    console.error('Error fetching public wishlist:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch wishlist' 
    });
  }
};

/**
 * Update item notes or notifications
 */
exports.updateWishlistItem = async (req, res) => {
  try {
    const { wishlistId, productId } = req.params;
    const { notes, notifyOnPriceDrop, notifyOnStock } = req.body;

    const wishlist = await Wishlist.findOne({ 
      _id: wishlistId, 
      userId: req.user._id 
    });

    if (!wishlist) {
      return res.status(404).json({ 
        success: false, 
        error: 'Wishlist not found' 
      });
    }

    const item = wishlist.items.find(item => 
      item.productId.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ 
        success: false, 
        error: 'Product not found in wishlist' 
      });
    }

    if (notes !== undefined) item.notes = notes;
    if (notifyOnPriceDrop !== undefined) item.notifyOnPriceDrop = notifyOnPriceDrop;
    if (notifyOnStock !== undefined) item.notifyOnStock = notifyOnStock;

    await wishlist.save();

    res.json({ 
      success: true, 
      data: wishlist,
      message: 'Wishlist item updated'
    });
  } catch (error) {
    console.error('Error updating wishlist item:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update wishlist item' 
    });
  }
};
