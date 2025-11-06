const SavedSearch = require('../models/SavedSearch.model');

/**
 * Save a search
 */
exports.saveSearch = async (req, res) => {
  try {
    const { name, filters, notifyOnNewResults } = req.body;
    const userId = req.user._id;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Search name is required'
      });
    }

    const savedSearch = await SavedSearch.create({
      userId,
      name: name.trim(),
      filters: filters || {},
      notifyOnNewResults: notifyOnNewResults || false
    });

    res.status(201).json({
      success: true,
      data: savedSearch,
      message: 'Search saved successfully'
    });
  } catch (error) {
    console.error('Error saving search:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save search'
    });
  }
};

/**
 * Get user's saved searches
 */
exports.getSavedSearches = async (req, res) => {
  try {
    const userId = req.user._id;

    const searches = await SavedSearch.find({ userId })
      .sort({ lastUsed: -1 });

    res.json({
      success: true,
      data: searches
    });
  } catch (error) {
    console.error('Error fetching saved searches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch saved searches'
    });
  }
};

/**
 * Update saved search
 */
exports.updateSavedSearch = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, filters, notifyOnNewResults } = req.body;
    const userId = req.user._id;

    const savedSearch = await SavedSearch.findOne({ _id: id, userId });

    if (!savedSearch) {
      return res.status(404).json({
        success: false,
        error: 'Saved search not found'
      });
    }

    if (name) savedSearch.name = name.trim();
    if (filters) savedSearch.filters = filters;
    if (notifyOnNewResults !== undefined) savedSearch.notifyOnNewResults = notifyOnNewResults;
    savedSearch.lastUsed = new Date();

    await savedSearch.save();

    res.json({
      success: true,
      data: savedSearch,
      message: 'Saved search updated successfully'
    });
  } catch (error) {
    console.error('Error updating saved search:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update saved search'
    });
  }
};

/**
 * Delete saved search
 */
exports.deleteSavedSearch = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const savedSearch = await SavedSearch.findOne({ _id: id, userId });

    if (!savedSearch) {
      return res.status(404).json({
        success: false,
        error: 'Saved search not found'
      });
    }

    await savedSearch.deleteOne();

    res.json({
      success: true,
      message: 'Saved search deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting saved search:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete saved search'
    });
  }
};

/**
 * Use saved search (update lastUsed)
 */
exports.useSavedSearch = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const savedSearch = await SavedSearch.findOne({ _id: id, userId });

    if (!savedSearch) {
      return res.status(404).json({
        success: false,
        error: 'Saved search not found'
      });
    }

    savedSearch.lastUsed = new Date();
    await savedSearch.save();

    res.json({
      success: true,
      data: savedSearch
    });
  } catch (error) {
    console.error('Error using saved search:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to use saved search'
    });
  }
};
