const { Store } = require('../models/Store');
const { Rating } = require('../models/Rating');

const storeOwnerController = {
  getDashboard: async (req, res) => {
    try {
      const userId = req.user.id;

      // Get store owner's stores
      const stores = await Store.getStoresByOwner(userId);
      if (stores.length === 0) {
        return res.status(404).json({ error: 'No store found for this owner' });
      }

      const storeId = stores[0].id;

      // Get store details
      const store = await Store.findById(storeId);

      // Get all ratings for this store
      const ratings = await Rating.getRatingsForStore(storeId);

      res.json({
        store,
        ratings,
        totalRatings: ratings.length,
        averageRating: store.average_rating
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = storeOwnerController;
