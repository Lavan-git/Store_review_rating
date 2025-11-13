const { User } = require('../models/User');
const { Store } = require('../models/Store');
const { Rating } = require('../models/Rating');

const adminController = {
  getDashboard: async (req, res) => {
    try {
      const usersResult = await User.findAll();
      const storesResult = await Store.findAll();
      const totalRatings = await Rating.getTotalRatingsCount();

      res.json({
        totalUsers: usersResult.length,
        totalStores: storesResult.length,
        totalRatings: totalRatings
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  addUser: async (req, res) => {
    try {
      const { name, email, password, address, role } = req.body;

      // Check if user exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Create user
      const user = await User.create(name, email, password, address, role);

      res.status(201).json({
        message: 'User added successfully',
        user
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  addStore: async (req, res) => {
    try {
      const { name, email, address } = req.body;

      // Create a store owner user if not exists
      const storeOwnerEmail = email;
      let storeOwner = await User.findByEmail(storeOwnerEmail);
      
      if (!storeOwner) {
        // Generate a temporary password for store owner
        const tempPassword = 'TempPassword123!';
        storeOwner = await User.create(name, storeOwnerEmail, tempPassword, address, 'store_owner');
      }

      // Create store
      const store = await Store.create(name, email, address, storeOwner.id);

      res.status(201).json({
        message: 'Store added successfully',
        store
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  listUsers: async (req, res) => {
    try {
      const { name, email, address, role, sortBy = 'name', sortDir = 'asc' } = req.query;

      const filters = {};
      if (name) filters.name = name;
      if (email) filters.email = email;
      if (address) filters.address = address;
      if (role) filters.role = role;

      const sort = {
        field: sortBy,
        direction: sortDir
      };

      const users = await User.findAll(filters, sort);

      res.json({ users });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  listStores: async (req, res) => {
    try {
      const { name, email, address, sortBy = 'name', sortDir = 'asc' } = req.query;

      const filters = {};
      if (name) filters.name = name;
      if (email) filters.email = email;
      if (address) filters.address = address;

      const sort = {
        field: sortBy,
        direction: sortDir
      };

      const stores = await Store.findAll(filters, sort);

      res.json({ stores });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getUserDetails: async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // If user is store owner, add average rating
      if (user.role === 'store_owner') {
        const stores = await Store.getStoresByOwner(userId);
        if (stores.length > 0) {
          const storeId = stores[0].id;
          const ratingData = await Rating.getStoreAverageRating(storeId);
          user.average_rating = ratingData.average_rating;
        }
      }

      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  ,

  getStoreDetails: async (req, res) => {
    try {
      const { storeId } = req.params;
      const store = await Store.findById(storeId);
      if (!store) return res.status(404).json({ error: 'Store not found' });
      res.json(store);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  updateUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const { name, email, address, role, password } = req.body;
      // Ensure target user exists
      const targetUser = await User.findById(userId);
      if (!targetUser) return res.status(404).json({ error: 'User not found' });

      // Admins are NOT allowed to reset passwords of other admins
      if (targetUser.role === 'admin' && password) {
        return res.status(403).json({ error: 'Forbidden to reset password for another admin' });
      }

      // If password provided (and target user isn't admin), update via updatePassword
      if (password) {
        await User.updatePassword(userId, password);
      }

      const updated = await User.update(userId, { name, email, address, role });
      if (!updated) return res.status(400).json({ error: 'No updatable fields provided' });

      res.json({ message: 'User updated successfully', user: updated });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const targetUser = await User.findById(userId);
      if (!targetUser) return res.status(404).json({ error: 'User not found' });

      // Prevent deletion of admin users
      if (targetUser.role === 'admin') {
        return res.status(403).json({ error: 'Cannot delete admin users' });
      }

      const deleted = await User.delete(userId);
      if (!deleted) return res.status(404).json({ error: 'User not found' });
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  updateStore: async (req, res) => {
    try {
      const { storeId } = req.params;
      const { name, email, address, owner_id } = req.body;

      const updated = await Store.update(storeId, { name, email, address, owner_id });
      if (!updated) return res.status(400).json({ error: 'No updatable fields provided' });

      res.json({ message: 'Store updated successfully', store: updated });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  deleteStore: async (req, res) => {
    try {
      const { storeId } = req.params;
      const deleted = await Store.delete(storeId);
      if (!deleted) return res.status(404).json({ error: 'Store not found' });
      res.json({ message: 'Store deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = adminController;
