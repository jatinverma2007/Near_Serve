// Validation middleware
// Validates request data

const validation = {
  // Validate service creation
  validateService: (req, res, next) => {
    // TODO: Implement validation logic
    next();
  },

  // Validate booking creation
  validateBooking: (req, res, next) => {
    // TODO: Implement validation logic
    next();
  },

  // Validate review creation
  validateReview: (req, res, next) => {
    // TODO: Implement validation logic
    next();
  },
};

module.exports = validation;
