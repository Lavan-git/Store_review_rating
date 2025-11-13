const { Store } = require('../models/Store');
const { Rating } = require('../models/Rating');

const storeOwnerController = {
getDashboard: async (req, res) => {
  try {
    const userId = req.user.id;

    // Get store owner's stores
    const stores = await Store.getStoresByOwner(userId);
    
    if (stores.length === 0) {
      // Return flag instead of 404 so frontend can show create form
      return res.json({ 
        hasStore: false,
        ownerEmail: req.user.email
      });
    }

    const storeId = stores[0].id;

    // Get store details
    const store = await Store.findById(storeId);

    // Get all ratings for this store
    const ratings = await Rating.getRatingsForStore(storeId);

    res.json({
      hasStore: true,
      store,
      ratings,
      totalRatings: ratings.length,
      averageRating: store.average_rating
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
},


  createStore: async (req, res) => {
    try {
      const ownerId = req.user.id;
      const email = req.user.email;  // Email comes from JWT, not request body
      const { name, address } = req.body;

      // Check if owner already has a store
      const existingStores = await Store.getStoresByOwner(ownerId);
      if (existingStores.length > 0) {
        return res.status(400).json({ error: 'You already have a store' });
      }

      // Create store with owner_id and email from JWT
      const store = await Store.create(name, email, address, ownerId);
      
      res.status(201).json({
        message: 'Store created successfully',
        store
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  updateStore: async (req, res) => {
    try {
      const ownerId = req.user.id;
      const { storeId } = req.params;
      const { name, address } = req.body;

      // Verify the store belongs to this owner
      const store = await Store.findById(storeId);
      if (!store) {
        return res.status(404).json({ error: 'Store not found' });
      }
      
      if (store.owner_id !== ownerId) {
        return res.status(403).json({ error: 'Not authorized to update this store' });
      }

      // Update only name and address; email stays unchanged
      const updatedStore = await Store.update(storeId, { name, address });
      
      res.json({
        message: 'Store updated successfully',
        store: updatedStore
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = storeOwnerController;
