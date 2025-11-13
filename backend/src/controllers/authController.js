const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { User } = require('../models/User');
const { PasswordReset } = require('../models/PasswordReset');

const authController = {
  signup: async (req, res) => {
    try {
      const { name, email, address, password } = req.body;

      // Check if user exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Create user
      const user = await User.create(name, email, password, address, 'normal_user');

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Verify password
      const passwordMatch = await User.verifyPassword(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          address: user.address
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      // Get user with password
      const user = await User.findByEmail(req.user.email);
      
      // Verify current password
      const passwordMatch = await User.verifyPassword(currentPassword, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      // Update password
      await User.updatePassword(userId, newPassword);

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  ,

  requestPasswordReset: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(200).json({ message: 'If that email is registered, you will receive a reset link' });
      }

      // Generate token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await PasswordReset.create(user.id, token, expiresAt);

      // Send email with nodemailer
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const resetLink = `${frontendUrl}/reset-password?token=${token}`;

      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: user.email,
        subject: 'Password Reset Request',
        text: `You requested a password reset. Use the following link to reset your password: ${resetLink}`,
        html: `<p>You requested a password reset. Click the link below to reset your password (expires in 1 hour):</p><p><a href="${resetLink}">${resetLink}</a></p>`
      };

      await transporter.sendMail(mailOptions);

      res.json({ message: 'If that email is registered, you will receive a reset link' });
    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  performPasswordReset: async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      const record = await PasswordReset.findByToken(token);
      if (!record) {
        return res.status(400).json({ error: 'Invalid or expired token' });
      }

      if (new Date(record.expires_at) < new Date()) {
        await PasswordReset.deleteById(record.id);
        return res.status(400).json({ error: 'Invalid or expired token' });
      }

      // Update user password
      await User.updatePassword(record.user_id, newPassword);

      // Delete token
      await PasswordReset.deleteById(record.id);

      res.json({ message: 'Password has been reset successfully' });
    } catch (error) {
      console.error('Perform password reset error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = authController;
