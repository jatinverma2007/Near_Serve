const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Provider = require('../models/Provider');
const Notification = require('../models/Notification');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (User)
const createBooking = async (req, res) => {
  try {
    const {
      serviceId,
      scheduledDate,
      scheduledTime,
      address,
      contact,
      customerNotes
    } = req.body;

    // Validate required fields
    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: 'Service ID is required'
      });
    }

    // Find the service
    const service = await Service.findById(serviceId).populate('providerId');
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    if (!service.isActive || !service.availability) {
      return res.status(400).json({
        success: false,
        message: 'Service is not available for booking'
      });
    }

    // Auto-generate scheduledDate if not provided (tomorrow at 10 AM)
    let bookingDate;
    if (scheduledDate) {
      bookingDate = new Date(scheduledDate);
    } else {
      bookingDate = new Date();
      bookingDate.setDate(bookingDate.getDate() + 1);
      bookingDate.setHours(10, 0, 0, 0);
    }

    // Auto-generate scheduledTime if not provided
    const finalScheduledTime = scheduledTime || '10:00 AM';

    // Auto-generate address from service location if not provided
    const finalAddress = address || {
      street: 'To be confirmed',
      city: service.location?.city || 'Not specified',
      state: service.location?.state || '',
      zipCode: service.location?.zipCode || ''
    };

    // Auto-generate contact from user if not provided
    const finalContact = contact || {
      phone: req.user.phone || 'To be confirmed',
      alternatePhone: ''
    };

    // Skip date validation for auto-generated dates
    // Simplified booking - skip strict validations for easy booking
    // Users can modify date/time/address after booking is created

    // Create booking
    const booking = new Booking({
      serviceId,
      userId: req.user.id,
      providerId: service.providerId._id,
      scheduledDate: bookingDate,
      scheduledTime: finalScheduledTime,
      price: service.price,
      customerNotes: customerNotes || 'Quick booking',
      address: finalAddress,
      contact: finalContact,
      status: 'pending'
    });

    await booking.save();

    // Populate booking details
    await booking.populate([
      { path: 'serviceId', select: 'title category price priceType' },
      { path: 'userId', select: 'name email' },
      { path: 'providerId', select: 'businessName contactInfo' }
    ]);

    // Create notification for provider
    try {
      await Notification.create({
        userId: service.providerId.userId,
        type: 'booking_created',
        title: 'New Booking Request',
        message: `You have a new booking request for ${service.title}`,
        relatedId: booking._id,
        relatedModel: 'Booking',
        priority: 'high'
      });
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating booking',
      error: error.message
    });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings
// @access  Private (User)
const getUserBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build query
    const query = { userId: req.user.id };

    if (status) {
      query.status = status;
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // Execute query
    const bookings = await Booking.find(query)
      .populate('serviceId', 'title category price priceType images location')
      .populate('providerId', 'businessName contactInfo rating')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      }
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
};

// @desc    Get provider bookings
// @route   GET /api/bookings/provider
// @access  Private (Provider)
const getProviderBookings = async (req, res) => {
  try {
    // Check if user has a provider profile
    const provider = await Provider.findOne({ userId: req.user.id });

    if (!provider) {
      return res.status(403).json({
        success: false,
        message: 'Only providers can access this endpoint'
      });
    }

    const { status, page = 1, limit = 10, sortBy = 'scheduledDate', sortOrder = 'asc' } = req.query;

    // Build query
    const query = { providerId: provider._id };

    if (status) {
      query.status = status;
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // Execute query
    const bookings = await Booking.find(query)
      .populate('serviceId', 'title category price priceType')
      .populate('userId', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Booking.countDocuments(query);

    // Get stats
    const stats = {
      pending: await Booking.countDocuments({ providerId: provider._id, status: 'pending' }),
      confirmed: await Booking.countDocuments({ providerId: provider._id, status: 'confirmed' }),
      inProgress: await Booking.countDocuments({ providerId: provider._id, status: 'in-progress' }),
      completed: await Booking.countDocuments({ providerId: provider._id, status: 'completed' }),
      cancelled: await Booking.countDocuments({ providerId: provider._id, status: 'cancelled' })
    };

    res.json({
      success: true,
      data: bookings,
      stats,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      }
    });
  } catch (error) {
    console.error('Get provider bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching provider bookings',
      error: error.message
    });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Provider)
const updateBookingStatus = async (req, res) => {
  try {
    const { status, providerNotes } = req.body;

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Find booking
    const booking = await Booking.findById(req.params.id)
      .populate('serviceId', 'title')
      .populate('userId', 'name');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user has a provider profile
    const provider = await Provider.findOne({ userId: req.user.id });

    if (!provider) {
      return res.status(403).json({
        success: false,
        message: 'Only providers can update booking status'
      });
    }

    // Check if booking belongs to this provider
    if (booking.providerId.toString() !== provider._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update bookings for your own services'
      });
    }

    // Validate status transitions
    const currentStatus = booking.status;
    
    // Prevent invalid status transitions
    if (currentStatus === 'completed' || currentStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot update booking that is already ${currentStatus}`
      });
    }

    // Update booking
    booking.status = status;
    
    if (providerNotes) {
      booking.providerNotes = providerNotes;
    }

    if (status === 'completed') {
      booking.completedAt = new Date();
      
      // Update provider stats
      provider.stats.completedBookings = (provider.stats.completedBookings || 0) + 1;
      await provider.save();
    }

    if (status === 'cancelled' || status === 'rejected') {
      booking.cancelledAt = new Date();
      
      if (status === 'cancelled') {
        provider.stats.cancelledBookings = (provider.stats.cancelledBookings || 0) + 1;
        await provider.save();
      }
    }

    await booking.save();

    // Populate updated booking
    await booking.populate([
      { path: 'serviceId', select: 'title category price priceType' },
      { path: 'userId', select: 'name email' },
      { path: 'providerId', select: 'businessName contactInfo' }
    ]);

    // Create notification for user
    try {
      const notificationMessages = {
        confirmed: 'Your booking has been confirmed',
        'in-progress': 'Your service is now in progress',
        completed: 'Your booking has been completed',
        cancelled: 'Your booking has been cancelled',
        rejected: 'Your booking request has been rejected'
      };

      await Notification.create({
        userId: booking.userId._id,
        type: `booking_${status.replace('-', '_')}`,
        title: 'Booking Update',
        message: notificationMessages[status] || 'Your booking status has been updated',
        relatedId: booking._id,
        relatedModel: 'Booking',
        priority: status === 'confirmed' || status === 'completed' ? 'high' : 'medium'
      });
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
    }

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating booking status',
      error: error.message
    });
  }
};

// @desc    Cancel booking (by user)
// @route   DELETE /api/bookings/:id
// @access  Private (User)
const cancelBooking = async (req, res) => {
  try {
    const { cancellationReason } = req.body;

    // Find booking
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking belongs to this user
    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own bookings'
      });
    }

    // Check if booking can be cancelled
    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed booking'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    // Update booking
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancellationReason = cancellationReason || 'Cancelled by user';
    
    await booking.save();

    // Notify provider
    try {
      await Notification.create({
        userId: booking.providerId.userId,
        type: 'booking_cancelled',
        title: 'Booking Cancelled',
        message: 'A customer has cancelled their booking',
        relatedId: booking._id,
        relatedModel: 'Booking',
        priority: 'medium'
      });
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error cancelling booking',
      error: error.message
    });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private (User or Provider)
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('serviceId', 'title category price priceType images location')
      .populate('userId', 'name email')
      .populate('providerId', 'businessName contactInfo rating address');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is authorized to view this booking
    const provider = await Provider.findOne({ userId: req.user.id });
    const isOwner = booking.userId._id.toString() === req.user.id;
    const isProvider = provider && booking.providerId._id.toString() === provider._id.toString();

    if (!isOwner && !isProvider) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this booking'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Get booking by ID error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching booking',
      error: error.message
    });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getProviderBookings,
  updateBookingStatus,
  cancelBooking,
  getBookingById
};
