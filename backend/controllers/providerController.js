// Provider controller
// Handles provider profile and operations

const Provider = require('../models/Provider');
const mongoose = require('mongoose');

const providerController = {
  // Create provider profile
  createProviderProfile: async (req, res) => {
    try {
      // Check if provider profile already exists
      const existingProvider = await Provider.findOne({ userId: req.user.id });
      
      if (existingProvider) {
        return res.status(400).json({ 
          success: false, 
          message: 'Provider profile already exists. Use update endpoint to modify.' 
        });
      }

      // Create new provider profile
      const providerData = {
        userId: req.user.id,
        ...req.body
      };

      const provider = await Provider.create(providerData);

      res.status(201).json({
        success: true,
        message: 'Provider profile created successfully',
        data: provider
      });
    } catch (error) {
      console.error('Create provider profile error:', error);
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ 
          success: false, 
          message: 'Validation failed',
          errors: messages
        });
      }

      res.status(500).json({ 
        success: false, 
        message: 'Failed to create provider profile',
        error: error.message 
      });
    }
  },

  // Get current user's provider profile
  getMyProviderProfile: async (req, res) => {
    try {
      const provider = await Provider.findOne({ userId: req.user.id });
      
      if (!provider) {
        return res.status(404).json({ 
          success: false, 
          message: 'Provider profile not found. Please create a provider profile first.' 
        });
      }

      res.status(200).json({
        success: true,
        data: provider
      });
    } catch (error) {
      console.error('Get my provider profile error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch provider profile',
        error: error.message 
      });
    }
  },

  // Get provider profile
  getProviderProfile: async (req, res) => {
    try {
      const provider = await Provider.findOne({ userId: req.user.id })
        .populate('userId', 'name email');
      
      if (!provider) {
        return res.status(404).json({ 
          success: false, 
          message: 'Provider profile not found' 
        });
      }

      res.status(200).json({
        success: true,
        provider: provider
      });
    } catch (error) {
      console.error('Get provider profile error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch provider profile',
        error: error.message 
      });
    }
  },

  // Update provider profile
  updateProviderProfile: async (req, res) => {
    try {
      const provider = await Provider.findOne({ userId: req.user.id });
      
      if (!provider) {
        return res.status(404).json({ 
          success: false, 
          message: 'Provider profile not found' 
        });
      }

      // Update allowed fields
      const allowedUpdates = [
        'businessName', 'bio', 'profileImage', 'coverImage',
        'contactInfo', 'address', 'serviceCategories', 'yearsOfExperience',
        'licenseNumber', 'insuranceInfo', 'certifications'
      ];

      Object.keys(req.body).forEach(key => {
        if (allowedUpdates.includes(key)) {
          provider[key] = req.body[key];
        }
      });

      await provider.save();

      res.status(200).json({
        success: true,
        message: 'Provider profile updated successfully',
        provider: provider
      });
    } catch (error) {
      console.error('Update provider profile error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update provider profile',
        error: error.message 
      });
    }
  },

  // Get provider services
  getProviderServices: async (req, res) => {
    try {
      const Service = require('../models/Service');
      
      // Get provider by userId
      const provider = await Provider.findOne({ userId: req.user.id });
      
      if (!provider) {
        return res.status(404).json({ 
          success: false, 
          message: 'Provider profile not found' 
        });
      }

      // Find all services for this provider
      const services = await Service.find({ providerId: provider._id })
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: services.length,
        services: services
      });
    } catch (error) {
      console.error('Get provider services error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch services',
        error: error.message 
      });
    }
  },

  // ========== Advanced Availability System ==========

  // Get provider availability
  getProviderAvailability: async (req, res) => {
    try {
      const { id } = req.params;

      const provider = await Provider.findById(id).select('weeklyAvailability breaks holidays availability');

      if (!provider) {
        return res.status(404).json({ 
          success: false, 
          message: 'Provider not found' 
        });
      }

      res.status(200).json({
        success: true,
        data: {
          isAvailable: provider.availability?.isAvailable ?? true,
          weeklyAvailability: provider.weeklyAvailability || [],
          breaks: provider.breaks || [],
          holidays: provider.holidays || []
        }
      });
    } catch (error) {
      console.error('Get availability error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch availability',
        error: error.message 
      });
    }
  },

  // Update full provider availability
  updateProviderAvailability: async (req, res) => {
    try {
      const { id } = req.params;
      const { weeklyAvailability, isAvailable } = req.body;

      // Verify the provider belongs to the authenticated user
      const provider = await Provider.findById(id);
      if (!provider) {
        return res.status(404).json({ 
          success: false, 
          message: 'Provider not found' 
        });
      }

      if (provider.userId.toString() !== req.user.id) {
        return res.status(403).json({ 
          success: false, 
          message: 'Not authorized to update this provider' 
        });
      }

      // Update availability
      const updateData = {};
      
      if (weeklyAvailability !== undefined) {
        updateData.weeklyAvailability = weeklyAvailability;
      }
      
      if (isAvailable !== undefined) {
        updateData['availability.isAvailable'] = isAvailable;
      }

      const updatedProvider = await Provider.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select('weeklyAvailability breaks holidays availability');

      res.status(200).json({
        success: true,
        message: 'Availability updated successfully',
        data: {
          isAvailable: updatedProvider.availability?.isAvailable ?? true,
          weeklyAvailability: updatedProvider.weeklyAvailability || [],
          breaks: updatedProvider.breaks || [],
          holidays: updatedProvider.holidays || []
        }
      });
    } catch (error) {
      console.error('Update availability error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update availability',
        error: error.message 
      });
    }
  },

  // Add a time slot to a specific day
  addAvailabilitySlot: async (req, res) => {
    try {
      const { id } = req.params;
      const { day, start, end } = req.body;

      if (!day || !start || !end) {
        return res.status(400).json({ 
          success: false, 
          message: 'Day, start time, and end time are required' 
        });
      }

      const provider = await Provider.findById(id);
      if (!provider) {
        return res.status(404).json({ 
          success: false, 
          message: 'Provider not found' 
        });
      }

      if (provider.userId.toString() !== req.user.id) {
        return res.status(403).json({ 
          success: false, 
          message: 'Not authorized to update this provider' 
        });
      }

      // Find or create the day entry
      let dayEntry = provider.weeklyAvailability.find(entry => entry.day === day);
      
      if (!dayEntry) {
        provider.weeklyAvailability.push({
          day,
          slots: [{ start, end }]
        });
      } else {
        dayEntry.slots.push({ start, end });
      }

      await provider.save();

      res.status(200).json({
        success: true,
        message: 'Time slot added successfully',
        data: {
          weeklyAvailability: provider.weeklyAvailability
        }
      });
    } catch (error) {
      console.error('Add slot error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to add time slot',
        error: error.message 
      });
    }
  },

  // Delete a time slot
  deleteAvailabilitySlot: async (req, res) => {
    try {
      const { id, slotId } = req.params;
      const { day } = req.body;

      if (!day) {
        return res.status(400).json({ 
          success: false, 
          message: 'Day is required' 
        });
      }

      const provider = await Provider.findById(id);
      if (!provider) {
        return res.status(404).json({ 
          success: false, 
          message: 'Provider not found' 
        });
      }

      if (provider.userId.toString() !== req.user.id) {
        return res.status(403).json({ 
          success: false, 
          message: 'Not authorized to update this provider' 
        });
      }

      // Find the day entry and remove the slot
      const dayEntry = provider.weeklyAvailability.find(entry => entry.day === day);
      
      if (dayEntry) {
        dayEntry.slots = dayEntry.slots.filter(slot => slot._id.toString() !== slotId);
        
        // Remove the day entry if no slots remain
        if (dayEntry.slots.length === 0) {
          provider.weeklyAvailability = provider.weeklyAvailability.filter(entry => entry.day !== day);
        }
      }

      await provider.save();

      res.status(200).json({
        success: true,
        message: 'Time slot deleted successfully',
        data: {
          weeklyAvailability: provider.weeklyAvailability
        }
      });
    } catch (error) {
      console.error('Delete slot error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to delete time slot',
        error: error.message 
      });
    }
  },

  // Add a holiday
  addHoliday: async (req, res) => {
    try {
      const { id } = req.params;
      const { date, reason } = req.body;

      if (!date || !reason) {
        return res.status(400).json({ 
          success: false, 
          message: 'Date and reason are required' 
        });
      }

      const provider = await Provider.findById(id);
      if (!provider) {
        return res.status(404).json({ 
          success: false, 
          message: 'Provider not found' 
        });
      }

      if (provider.userId.toString() !== req.user.id) {
        return res.status(403).json({ 
          success: false, 
          message: 'Not authorized to update this provider' 
        });
      }

      // Check if holiday already exists for this date
      const existingHoliday = provider.holidays.find(h => h.date === date);
      if (existingHoliday) {
        return res.status(400).json({ 
          success: false, 
          message: 'Holiday already exists for this date' 
        });
      }

      provider.holidays.push({ date, reason });
      await provider.save();

      res.status(200).json({
        success: true,
        message: 'Holiday added successfully',
        data: {
          holidays: provider.holidays
        }
      });
    } catch (error) {
      console.error('Add holiday error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to add holiday',
        error: error.message 
      });
    }
  },

  // Delete a holiday
  deleteHoliday: async (req, res) => {
    try {
      const { id, holidayId } = req.params;

      const provider = await Provider.findById(id);
      if (!provider) {
        return res.status(404).json({ 
          success: false, 
          message: 'Provider not found' 
        });
      }

      if (provider.userId.toString() !== req.user.id) {
        return res.status(403).json({ 
          success: false, 
          message: 'Not authorized to update this provider' 
        });
      }

      provider.holidays = provider.holidays.filter(holiday => holiday._id.toString() !== holidayId);
      await provider.save();

      res.status(200).json({
        success: true,
        message: 'Holiday deleted successfully',
        data: {
          holidays: provider.holidays
        }
      });
    } catch (error) {
      console.error('Delete holiday error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to delete holiday',
        error: error.message 
      });
    }
  },

  // Add a break
  addBreak: async (req, res) => {
    try {
      const { id } = req.params;
      const { date, start, end, reason } = req.body;

      if (!date || !start || !end) {
        return res.status(400).json({ 
          success: false, 
          message: 'Date, start time, and end time are required' 
        });
      }

      const provider = await Provider.findById(id);
      if (!provider) {
        return res.status(404).json({ 
          success: false, 
          message: 'Provider not found' 
        });
      }

      if (provider.userId.toString() !== req.user.id) {
        return res.status(403).json({ 
          success: false, 
          message: 'Not authorized to update this provider' 
        });
      }

      provider.breaks.push({ date, start, end, reason });
      await provider.save();

      res.status(200).json({
        success: true,
        message: 'Break added successfully',
        data: {
          breaks: provider.breaks
        }
      });
    } catch (error) {
      console.error('Add break error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to add break',
        error: error.message 
      });
    }
  },

  // Delete a break
  deleteBreak: async (req, res) => {
    try {
      const { id, breakId } = req.params;

      const provider = await Provider.findById(id);
      if (!provider) {
        return res.status(404).json({ 
          success: false, 
          message: 'Provider not found' 
        });
      }

      if (provider.userId.toString() !== req.user.id) {
        return res.status(403).json({ 
          success: false, 
          message: 'Not authorized to update this provider' 
        });
      }

      provider.breaks = provider.breaks.filter(brk => brk._id.toString() !== breakId);
      await provider.save();

      res.status(200).json({
        success: true,
        message: 'Break deleted successfully',
        data: {
          breaks: provider.breaks
        }
      });
    } catch (error) {
      console.error('Delete break error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to delete break',
        error: error.message 
      });
    }
  }
};

module.exports = providerController;
