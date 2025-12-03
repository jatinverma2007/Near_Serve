const Service = require('../models/Service');
const Provider = require('../models/Provider');

// @desc    Get all services
// @route   GET /api/services
// @access  Public
const getAllServices = async (req, res) => {
  try {
    const {
      category,
      city,
      minPrice,
      maxPrice,
      minRating,
      availability,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (city) {
      query['location.city'] = city;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    if (availability !== undefined) {
      query.availability = availability === 'true';
    }

    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // Execute query
    const services = await Service.find(query)
      .populate('providerId', 'businessName contactInfo rating')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Service.countDocuments(query);

    res.json({
      success: true,
      data: services,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      }
    });
  } catch (error) {
    console.error('Get all services error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching services',
      error: error.message
    });
  }
};

// @desc    Get service by ID
// @route   GET /api/services/:id
// @access  Public
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('providerId', 'businessName bio contactInfo address rating verification');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Get service by ID error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching service',
      error: error.message
    });
  }
};

// @desc    Create new service
// @route   POST /api/services
// @access  Private (Provider only)
const createService = async (req, res) => {
  try {
    // Check if user has a provider profile
    const provider = await Provider.findOne({ userId: req.user.id });

    if (!provider) {
      return res.status(403).json({
        success: false,
        message: 'Only providers can create services. Please create a provider profile first.'
      });
    }

    if (!provider.isActive || provider.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Your provider account is not active or is suspended.'
      });
    }

    const {
      title,
      description,
      category,
      price,
      priceType,
      location,
      images,
      serviceArea
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !price) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, category, and price are required'
      });
    }

    if (!location || !location.city) {
      return res.status(400).json({
        success: false,
        message: 'Location with city is required'
      });
    }

    // Create service
    const service = new Service({
      title,
      description,
      category,
      price,
      priceType: priceType || 'hourly',
      providerId: provider._id,
      location,
      images: images || [],
      serviceArea: serviceArea || 10
    });

    await service.save();

    // Populate provider info before sending response
    await service.populate('providerId', 'businessName contactInfo rating');

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service
    });
  } catch (error) {
    console.error('Create service error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating service',
      error: error.message
    });
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Provider only - own services)
const updateService = async (req, res) => {
  try {
    // Find the service
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if user has a provider profile
    const provider = await Provider.findOne({ userId: req.user.id });

    if (!provider) {
      return res.status(403).json({
        success: false,
        message: 'Only providers can update services'
      });
    }

    // Check if the service belongs to this provider
    if (service.providerId.toString() !== provider._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own services'
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'title',
      'description',
      'category',
      'price',
      'priceType',
      'location',
      'images',
      'serviceArea',
      'availability',
      'isActive'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        service[field] = req.body[field];
      }
    });

    await service.save();

    // Populate provider info
    await service.populate('providerId', 'businessName contactInfo rating');

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: service
    });
  } catch (error) {
    console.error('Update service error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID format'
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating service',
      error: error.message
    });
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (Provider only - own services)
const deleteService = async (req, res) => {
  try {
    // Find the service
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if user has a provider profile
    const provider = await Provider.findOne({ userId: req.user.id });

    if (!provider) {
      return res.status(403).json({
        success: false,
        message: 'Only providers can delete services'
      });
    }

    // Check if the service belongs to this provider
    if (service.providerId.toString() !== provider._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own services'
      });
    }

    // Hard delete - remove the service from database
    await service.deleteOne();

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error deleting service',
      error: error.message
    });
  }
};

// @desc    Search services
// @route   GET /api/services/search
// @access  Public
const searchServices = async (req, res) => {
  try {
    const { q, category, city, lat, lng, radius = 10 } = req.query;

    if (!q && !category && !city && (!lat || !lng)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide search query, category, city, or coordinates'
      });
    }

    const query = { isActive: true, availability: true };

    // Text search
    if (q) {
      query.$or = [
        { title: new RegExp(q, 'i') },
        { description: new RegExp(q, 'i') }
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // City filter
    if (city) {
      query['location.city'] = city;
    }

    // Location-based search
    if (lat && lng) {
      // This is a simple implementation
      // For production, consider using MongoDB geospatial queries
      const latitude = Number(lat);
      const longitude = Number(lng);
      const radiusKm = Number(radius);
      
      // Rough calculation: 1 degree ≈ 111km
      const latRange = radiusKm / 111;
      const lngRange = radiusKm / (111 * Math.cos(latitude * Math.PI / 180));

      query['location.coordinates.latitude'] = {
        $gte: latitude - latRange,
        $lte: latitude + latRange
      };
      query['location.coordinates.longitude'] = {
        $gte: longitude - lngRange,
        $lte: longitude + lngRange
      };
    }

    const services = await Service.find(query)
      .populate('providerId', 'businessName contactInfo rating')
      .sort({ rating: -1, createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('Search services error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching services',
      error: error.message
    });
  }
};

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  searchServices
};
