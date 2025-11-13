const { body, validationResult } = require('express-validator');

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,16}$)/;
  return passwordRegex.test(password);
};

const validateSignup = [
  body('name')
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters'),
  body('email')
    .trim()
    .custom(validateEmail)
    .withMessage('Invalid email format'),
  body('address')
    .trim()
    .isLength({ max: 400 })
    .withMessage('Address must not exceed 400 characters'),
  body('password')
    .custom(validatePassword)
    .withMessage('Password must be 8-16 characters with at least one uppercase letter and one special character')
];

const validateAddUser = [
  body('name')
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters'),
  body('email')
    .trim()
    .custom(validateEmail)
    .withMessage('Invalid email format'),
  body('address')
    .trim()
    .isLength({ max: 400 })
    .withMessage('Address must not exceed 400 characters'),
  body('password')
    .custom(validatePassword)
    .withMessage('Password must be 8-16 characters with at least one uppercase letter and one special character'),
  body('role')
    .isIn(['normal_user', 'admin', 'store_owner'])
    .withMessage('Invalid role')
];

const validateUpdateUser = [
  body('name').optional().trim().isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters'),
  body('email').optional().trim().custom(validateEmail)
    .withMessage('Invalid email format'),
  body('address').optional().trim().isLength({ max: 400 })
    .withMessage('Address must not exceed 400 characters'),
  body('role').optional().isIn(['normal_user', 'admin', 'store_owner'])
    .withMessage('Invalid role'),
  body('keep_old_password').optional().isBoolean()
    .withMessage('keep_old_password must be boolean'),
  body('password')
    .optional({ checkFalsy: true })
    .custom(validatePassword)
    .withMessage('Password must be 8-16 characters with at least one uppercase letter and one special character'),
];

const validateAddStore = [
  body('name')
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters'),
  body('email')
    .trim()
    .custom(validateEmail)
    .withMessage('Invalid email format'),
  body('address')
    .trim()
    .isLength({ max: 400 })
    .withMessage('Address must not exceed 400 characters')
];

const validateRating = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5')
];

const validatePasswordChange = [
  body('newPassword')
    .custom(validatePassword)
    .withMessage('Password must be 8-16 characters with at least one uppercase letter and one special character')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  validateSignup,
  validateAddUser,
  validateAddStore,
  validateRating,
  validatePasswordChange,
  validateUpdateUser,
  handleValidationErrors
};
