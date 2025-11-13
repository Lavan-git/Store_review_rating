const { Store } = require('../models/Store');
const { Rating } = require('../models/Rating');

const userController = {
  listStores: async (req, res) => {
    try {
      const { search, sortBy = 'name', sortDir = 'asc' } = req.query;
      const userId = req.user.id;

      const filters = {};
      if (search) {
        filters.name = search;
      }

      const sort = {
        field: sortBy,
        direction: sortDir
      };

      const stores = await Store.findAll(filters, sort);

      // Get user's ratings for each store
      const storesWithRatings = await Promise.all(
        stores.map(async (store) => {
          const userRating = await Rating.findByUserAndStore(userId, store.id);
          return {
            ...store,
            userRating: userRating?.rating || null
          };
        })
      );

      res.json({ stores: storesWithRatings });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  submitRating: async (req, res) => {
    try {
      const { storeId } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user.id;

      // Check if store exists
      const store = await Store.findById(storeId);
      if (!store) {
        return res.status(404).json({ error: 'Store not found' });
      }

      // Check if user already rated this store
      const existingRating = await Rating.findByUserAndStore(userId, storeId);

      let ratingRecord;
      if (existingRating) {
        ratingRecord = await Rating.update(userId, storeId, rating, comment);
      } else {
        ratingRecord = await Rating.create(userId, storeId, rating, comment);
      }

      res.json({
        message: existingRating ? 'Rating updated successfully' : 'Rating submitted successfully',
        rating: ratingRecord
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = userController;
