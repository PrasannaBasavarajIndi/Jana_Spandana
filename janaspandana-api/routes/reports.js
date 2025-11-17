// routes/reports.js

const util = require('util');
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/uploader');
const Report = require('../models/Report');
const User = require('../models/User');
const aiService = require('../services/aiService');
const mlPredictor = require('../services/mlPredictor');

// ---
// @route   POST /api/reports
// @desc    Submit a new report
// @access  Private (Requires token)
// ---
router.post(
  '/',
  [auth, upload.single('image')],
  async (req, res) => {
    // 'image' must match the FormData key from the frontend

    // 3. Get text data from req.body
    const {
      title,
      description,
      report_type,
      location, // This will now be a STRING
      address_text,
    } = req.body;

    try {
      // Validate required fields
      if (!title || !description || !report_type || !location) {
        return res.status(400).json({ 
          msg: 'Missing required fields: title, description, report_type, and location are required' 
        });
      }

      // 4. Get the image URL from the uploaded file
      // Multer/Cloudinary adds 'req.file'
      const imageUrl = req.file ? req.file.path : null;

      // 5. Parse the location string back into an object
      let parsedLocation;
      try {
        parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
      } catch (parseError) {
        return res.status(400).json({ 
          msg: 'Invalid location format. Location must be valid JSON.' 
        });
      }

      // Validate location structure
      if (!parsedLocation || !parsedLocation.coordinates || !Array.isArray(parsedLocation.coordinates) || parsedLocation.coordinates.length < 2) {
        return res.status(400).json({ 
          msg: 'Invalid location coordinates. Must be [longitude, latitude]' 
        });
      }

      // Ensure location has correct structure for GeoJSON
      if (!parsedLocation.type) {
        parsedLocation.type = 'Point';
      }
      
      // Ensure coordinates are numbers
      parsedLocation.coordinates = [
        parseFloat(parsedLocation.coordinates[0]),
        parseFloat(parsedLocation.coordinates[1])
      ];
      
      if (isNaN(parsedLocation.coordinates[0]) || isNaN(parsedLocation.coordinates[1])) {
        return res.status(400).json({ 
          msg: 'Invalid location coordinates. Longitude and latitude must be valid numbers.' 
        });
      }

      // Create report object first for AI processing
      const reportData = {
        title,
        description,
        report_type,
        location: parsedLocation,
        address_text,
        media_urls: imageUrl ? [imageUrl] : [],
        submitted_by_user_id: req.user.id,
        updates_log: [
          {
            user_id: req.user.id,
            comment: 'Report submitted.',
            timestamp: new Date()
          },
        ],
        updated_at: Date.now(),
      };

      // AI/ML Processing (wrapped in try-catch to not break submission)
      try {
        // 1. Calculate priority score
        let nearbyReports = 0;
        try {
          nearbyReports = await Report.countDocuments({
            location: {
              $near: {
                $geometry: {
                  type: 'Point',
                  coordinates: parsedLocation.coordinates
                },
                $maxDistance: 500 // 500 meters
              }
            }
          });
        } catch (geoError) {
          // If geospatial query fails, just use 0
          console.warn('Geospatial query failed, using 0 for nearby reports:', geoError.message);
        }
        
        const priorityScore = aiService.calculatePriorityScore(reportData, { nearbyReports });
        // Ensure priority_score is a valid number
        reportData.priority_score = Number(priorityScore);
        if (isNaN(reportData.priority_score) || !isFinite(reportData.priority_score)) {
          reportData.priority_score = 50; // Default to medium priority
        }

        // 2. Generate AI tags
        reportData.ai_tags = aiService.generateTags(reportData);

        // 3. Analyze sentiment
        const sentiment = aiService.analyzeSentiment(`${title} ${description}`);
        reportData.sentiment_analysis = sentiment;

        // 4. Image classification
        const classification = aiService.classifyImageFromReport(reportData);
        reportData.ai_classification = classification;
      } catch (aiError) {
        // If AI processing fails, continue without it
        console.error('AI processing error (non-fatal):', aiError.message);
        // Set defaults
        reportData.priority_score = 50;
        reportData.ai_tags = [];
        reportData.sentiment_analysis = { sentiment: 'neutral', score: 0 };
        reportData.ai_classification = { predictedType: report_type, confidence: 0 };
      }

      // 5. Detect duplicates (after saving, so we can check against existing reports)
      // We'll do this after the report is saved

      const newReport = new Report(reportData);
      const report = await newReport.save();

      // Detect duplicates after report is saved
      try {
        const duplicates = await aiService.detectDuplicates(report);
        if (duplicates.length > 0) {
          report.is_duplicate = true;
          report.duplicate_of = duplicates[0].report_id;
          await report.save();
        }
      } catch (dupError) {
        // Non-fatal error, just log it
        console.error('Duplicate detection error (non-fatal):', dupError.message);
      }

      res.status(201).json(report);
    } catch (err) {
      // This will force-print the entire error object in your terminal
      console.error('--- SERVER CRASH ---');
      console.error(
        util.inspect(err, { showHidden: false, depth: null, colors: true })
      );
      console.error('--- END OF CRASH ---');

      // Log the full error for debugging
      console.error('Report submission error:', err);
      
      // Return user-friendly error message
      if (err.name === 'ValidationError') {
        return res.status(400).json({ 
          msg: 'Validation error: ' + Object.values(err.errors).map(e => e.message).join(', ')
        });
      }
      
      res.status(500).json({ 
        msg: 'An unexpected error occurred. Please try again.',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
);

// ---
// @route   GET /api/reports
// @desc    Get all reports (to display on the map)
// @access  Public
// ---
router.get('/', async (req, res) => {
  try {
    // Find all reports and sort them by 'created_at' (newest first)
    const reports = await Report.find()
      .populate('submitted_by_user_id', 'full_name email')
      .populate('assigned_to_worker_id', 'full_name email')
      .populate('likes', 'full_name')
      .populate('comments.user_id', 'full_name email')
      .sort({ created_at: -1 });
    res.json(reports);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ---
// @route   GET /api/reports/nearby
// @desc    Get reports near a location
// @access  Public
// ---
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query; // radius in meters, default 5km
    
    if (!lat || !lng) {
      return res.status(400).json({ msg: 'Latitude and longitude are required' });
    }

    const reports = await Report.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      }
    })
      .populate('submitted_by_user_id', 'full_name email')
      .populate('likes', 'full_name')
      .populate('comments.user_id', 'full_name email')
      .limit(50)
      .sort({ created_at: -1 });

    res.json(reports);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ---
// @route   GET /api/reports/:id
// @desc    Get a single report by ID
// @access  Public
// ---
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('submitted_by_user_id', 'full_name email')
      .populate('assigned_to_worker_id', 'full_name email')
      .populate('likes', 'full_name')
      .populate('comments.user_id', 'full_name email');
    
    if (!report) {
      return res.status(404).json({ msg: 'Report not found' });
    }
    res.json(report);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ---
// @route   POST /api/reports/:id/like
// @desc    Like or unlike a report
// @access  Private
// ---
router.post('/:id/like', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ msg: 'Report not found' });
    }

    const userId = req.user.id;
    const isLiked = report.likes.includes(userId);

    if (isLiked) {
      report.likes = report.likes.filter(id => id.toString() !== userId.toString());
    } else {
      report.likes.push(userId);
    }

    await report.save();
    res.json({ likes: report.likes.length, isLiked: !isLiked });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ---
// @route   POST /api/reports/:id/comment
// @desc    Add a comment to a report
// @access  Private
// ---
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ msg: 'Comment text is required' });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ msg: 'Report not found' });
    }

    report.comments.push({
      user_id: req.user.id,
      text: text.trim()
    });

    await report.save();
    const updatedReport = await Report.findById(req.params.id)
      .populate('comments.user_id', 'full_name email');
    
    res.json(updatedReport.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ---
// @route   PUT /api/reports/:id/assign
// @desc    Worker assigns workforce and budget to a report
// @access  Private (Worker only)
// ---
router.put('/:id/assign', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'WORKER') {
      return res.status(403).json({ msg: 'Only workers can assign workforce and budget' });
    }

    const { assigned_workforce, assigned_budget, status } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ msg: 'Report not found' });
    }

    if (assigned_workforce !== undefined) report.assigned_workforce = assigned_workforce;
    if (assigned_budget !== undefined) report.assigned_budget = assigned_budget;
    if (status && ['PENDING', 'WORKING', 'CLEARED', 'REJECTED'].includes(status)) {
      report.status = status;
    }
    
    report.assigned_to_worker_id = user._id;
    report.updated_at = Date.now();
    
    report.updates_log.push({
      user_id: user._id,
      comment: `Workforce: ${assigned_workforce || report.assigned_workforce}, Budget: ${assigned_budget || report.assigned_budget}, Status: ${status || report.status}`,
      status_change: status || report.status
    });

    await report.save();
    const updatedReport = await Report.findById(req.params.id)
      .populate('submitted_by_user_id', 'full_name email')
      .populate('assigned_to_worker_id', 'full_name email');
    
    res.json(updatedReport);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ---
// @route   GET /api/reports/stats/admin
// @desc    Get statistics for admin dashboard
// @access  Private (Admin only)
// ---
router.get('/stats/admin', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ msg: 'Only admins can access statistics' });
    }

    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'PENDING' });
    const workingReports = await Report.countDocuments({ status: 'WORKING' });
    const clearedReports = await Report.countDocuments({ status: 'CLEARED' });
    const rejectedReports = await Report.countDocuments({ status: 'REJECTED' });

    // Reports by type
    const reportsByType = await Report.aggregate([
      {
        $group: {
          _id: '$report_type',
          count: { $sum: 1 }
        }
      }
    ]);

    // Reports by status over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const reportsOverTime = await Report.aggregate([
      {
        $match: {
          created_at: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    // Total budget allocated
    const totalBudget = await Report.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$assigned_budget' }
        }
      }
    ]);

    // Total workforce allocated
    const totalWorkforce = await Report.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$assigned_workforce' }
        }
      }
    ]);

    res.json({
      summary: {
        total: totalReports,
        pending: pendingReports,
        working: workingReports,
        cleared: clearedReports,
        rejected: rejectedReports,
        resolutionRate: totalReports > 0 ? ((clearedReports / totalReports) * 100).toFixed(2) : 0
      },
      byType: reportsByType,
      overTime: reportsOverTime,
      totalBudget: totalBudget[0]?.total || 0,
      totalWorkforce: totalWorkforce[0]?.total || 0
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ---
// @route   GET /api/reports/ai/insights
// @desc    Get AI-powered insights and analytics
// @access  Private (Admin only)
// ---
router.get('/ai/insights', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ msg: 'Only admins can access AI insights' });
    }

    // Get high-risk areas
    const riskAreas = await aiService.predictHighRiskAreas();

    // Get reports with highest priority
    const highPriorityReports = await Report.find()
      .sort({ priority_score: -1 })
      .limit(10)
      .populate('submitted_by_user_id', 'full_name email');

    // Sentiment analysis of all comments
    const allReports = await Report.find().populate('comments.user_id', 'full_name');
    let totalSentiment = { positive: 0, negative: 0, neutral: 0 };
    
    allReports.forEach(report => {
      if (report.comments && report.comments.length > 0) {
        report.comments.forEach(comment => {
          const sentiment = aiService.analyzeSentiment(comment.text);
          totalSentiment[sentiment.sentiment]++;
        });
      }
    });

    // Duplicate reports
    const duplicateReports = await Report.find({ is_duplicate: true }).countDocuments();

    res.json({
      riskAreas,
      highPriorityReports,
      sentimentAnalysis: totalSentiment,
      duplicateReports,
      aiFeatures: {
        priorityScoring: 'Active',
        duplicateDetection: 'Active',
        sentimentAnalysis: 'Active',
        imageClassification: 'Active',
        predictiveAnalytics: 'Active'
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ---
// @route   GET /api/reports/ai/priority
// @desc    Get reports sorted by AI-calculated priority
// @access  Private
// ---
router.get('/ai/priority', auth, async (req, res) => {
  try {
    const reports = await Report.find()
      .sort({ priority_score: -1 })
      .populate('submitted_by_user_id', 'full_name email')
      .populate('assigned_to_worker_id', 'full_name email')
      .limit(50);
    
    res.json(reports);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ---
// @route   GET /api/reports/:id/ai-suggestions
// @desc    Get AI suggestions for workforce and budget
// @access  Private (Worker only)
// ---
router.get('/:id/ai-suggestions', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'WORKER') {
      return res.status(403).json({ msg: 'Only workers can access AI suggestions' });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ msg: 'Report not found' });
    }

    const predictions = await mlPredictor.getPredictions(report);
    res.json(predictions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ---
// @route   POST /api/reports/ai/train-model
// @desc    Train the ML model on historical data
// @access  Private (Admin only)
// ---
router.post('/ai/train-model', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERVISOR')) {
      return res.status(403).json({ msg: 'Only admins and supervisors can train the model' });
    }

    const result = await mlPredictor.trainModel();
    res.json({
      success: true,
      ...result,
      message: result.trained 
        ? `Model trained successfully on ${result.samples} samples` 
        : `Not enough data to train. Need at least 10 cleared reports with workforce and budget.`
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---
// @route   GET /api/reports/ai/model-stats
// @desc    Get ML model statistics
// @access  Private
// ---
router.get('/ai/model-stats', auth, async (req, res) => {
  try {
    const stats = mlPredictor.getModelStats();
    res.json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;