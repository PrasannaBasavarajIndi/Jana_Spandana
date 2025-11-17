// services/aiService.js
// AI & ML Services for Janaspandana

const Report = require('../models/Report');
const natural = require('natural');

/**
 * 1. PRIORITY SCORING ALGORITHM
 * Calculates priority score based on multiple factors
 */
function calculatePriorityScore(report, historicalData = {}) {
  let score = 0;
  
  // Factor 1: Report Type (0-30 points)
  const typeScores = {
    'Water Leak': 30,      // High priority - can cause damage
    'Pothole': 25,         // Medium-high - safety hazard
    'Street Light': 20,    // Medium - security concern
    'Garbage': 15,         // Medium - health concern
    'Other': 10            // Low-medium
  };
  score += typeScores[report.report_type] || 10;
  
  // Factor 2: Location Density (0-25 points)
  // More reports in same area = higher priority
  const nearbyReports = Number(historicalData.nearbyReports) || 0;
  score += Math.min(nearbyReports * 2, 25);
  
  // Factor 3: User Engagement (0-20 points)
  const likes = Number(report.likes?.length) || 0;
  const comments = Number(report.comments?.length) || 0;
  score += Math.min((likes * 2) + (comments * 3), 20);
  
  // Factor 4: Time Decay (0-15 points)
  // Older reports get higher priority
  let daysSinceCreation = 0;
  if (report.created_at) {
    const timeDiff = Date.now() - new Date(report.created_at).getTime();
    daysSinceCreation = timeDiff / (1000 * 60 * 60 * 24);
    if (isNaN(daysSinceCreation) || daysSinceCreation < 0) {
      daysSinceCreation = 0;
    }
  }
  score += Math.min(daysSinceCreation * 2, 15);
  
  // Factor 5: Description Urgency Keywords (0-10 points)
  const urgentKeywords = ['urgent', 'emergency', 'dangerous', 'critical', 'immediate', 'severe', 'broken', 'damaged'];
  const description = (report.description || '').toLowerCase();
  let keywordScore = 0;
  urgentKeywords.forEach(keyword => {
    if (description.includes(keyword)) {
      keywordScore += 2;
    }
  });
  keywordScore = Math.min(keywordScore, 10); // Cap at 10
  score += keywordScore;
  
  // Ensure score is a valid number
  score = Number(score);
  if (isNaN(score) || !isFinite(score)) {
    score = 50; // Default to medium priority if calculation fails
  }
  
  // Normalize to 0-100 scale
  return Math.min(Math.max(Math.round(score), 0), 100);
}

/**
 * 2. DUPLICATE DETECTION
 * Detects potential duplicate reports based on location and similarity
 */
async function detectDuplicates(newReport) {
  const duplicates = [];
  const radius = 100; // meters
  
  try {
    // Ensure report has location coordinates
    if (!newReport.location || !newReport.location.coordinates || newReport.location.coordinates.length < 2) {
      return [];
    }

    // Find reports within radius
    const nearbyReports = await Report.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [
              newReport.location.coordinates[0],
              newReport.location.coordinates[1]
            ]
          },
          $maxDistance: radius
        }
      },
      _id: { $ne: newReport._id },
      status: { $in: ['PENDING', 'WORKING'] }
    }).limit(10); // Limit to 10 for performance
    
    // Check similarity using string similarity
    const newDescription = (newReport.description || '').toLowerCase();
    const newTitle = (newReport.title || '').toLowerCase();
    
    nearbyReports.forEach(report => {
      const reportDescription = (report.description || '').toLowerCase();
      const reportTitle = (report.title || '').toLowerCase();
      
      // Calculate similarity using Jaro-Winkler distance
      const titleSimilarity = natural.JaroWinklerDistance(newTitle, reportTitle);
      const descSimilarity = natural.JaroWinklerDistance(newDescription, reportDescription);
      
      // Check if same report type
      const sameType = report.report_type === newReport.report_type;
      
      // If high similarity and same type, it's likely a duplicate
      if ((titleSimilarity > 0.7 || descSimilarity > 0.7) && sameType) {
        duplicates.push({
          report_id: report._id,
          similarity: Math.max(titleSimilarity, descSimilarity),
          reason: titleSimilarity > 0.7 ? 'Similar title' : 'Similar description'
        });
      }
    });
    
    return duplicates.sort((a, b) => b.similarity - a.similarity);
  } catch (error) {
    console.error('Error detecting duplicates:', error);
    return [];
  }
}

/**
 * 3. SENTIMENT ANALYSIS
 * Analyzes text sentiment (positive, negative, neutral)
 */
function analyzeSentiment(text) {
  if (!text || text.trim() === '') {
    return { sentiment: 'neutral', score: 0 };
  }
  
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(text.toLowerCase());
  
  // Simple sentiment lexicon
  const positiveWords = ['good', 'great', 'excellent', 'fixed', 'resolved', 'thanks', 'thank', 'appreciate', 'helpful', 'fast', 'quick'];
  const negativeWords = ['bad', 'terrible', 'awful', 'broken', 'damaged', 'urgent', 'dangerous', 'critical', 'failed', 'slow', 'delayed'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  tokens.forEach(token => {
    if (positiveWords.includes(token)) positiveCount++;
    if (negativeWords.includes(token)) negativeCount++;
  });
  
  const total = positiveCount + negativeCount;
  if (total === 0) {
    return { sentiment: 'neutral', score: 0 };
  }
  
  const score = (positiveCount - negativeCount) / total;
  
  let sentiment = 'neutral';
  if (score > 0.2) sentiment = 'positive';
  else if (score < -0.2) sentiment = 'negative';
  
  return {
    sentiment,
    score: Math.round(score * 100) / 100,
    positiveCount,
    negativeCount
  };
}

/**
 * 4. AUTO-TAGGING
 * Automatically generates tags based on report content
 */
function generateTags(report) {
  const tags = [];
  const text = `${report.title} ${report.description}`.toLowerCase();
  
  // Location-based tags
  if (report.address_text) {
    const address = report.address_text.toLowerCase();
    if (address.includes('street') || address.includes('road')) tags.push('street');
    if (address.includes('park')) tags.push('park');
    if (address.includes('school')) tags.push('school');
    if (address.includes('hospital')) tags.push('hospital');
  }
  
  // Content-based tags
  if (text.includes('urgent') || text.includes('emergency')) tags.push('urgent');
  if (text.includes('safety') || text.includes('danger')) tags.push('safety-hazard');
  if (text.includes('water')) tags.push('water-related');
  if (text.includes('traffic') || text.includes('road')) tags.push('traffic');
  if (text.includes('health') || text.includes('hygiene')) tags.push('health');
  
  // Type-based tags
  tags.push(report.report_type.toLowerCase().replace(' ', '-'));
  
  return [...new Set(tags)]; // Remove duplicates
}

/**
 * 5. PREDICTIVE ANALYTICS
 * Predicts which areas might need attention
 */
async function predictHighRiskAreas(radius = 1000) {
  try {
    // Get all pending and working reports
    const activeReports = await Report.find({
      status: { $in: ['PENDING', 'WORKING'] }
    });
    
    // Cluster reports by location
    const clusters = {};
    
    activeReports.forEach(report => {
      const lat = Math.round(report.location.coordinates[1] * 100) / 100;
      const lng = Math.round(report.location.coordinates[0] * 100) / 100;
      const key = `${lat},${lng}`;
      
      if (!clusters[key]) {
        clusters[key] = {
          location: { lat, lng },
          count: 0,
          types: {},
          avgPriority: 0
        };
      }
      
      clusters[key].count++;
      clusters[key].types[report.report_type] = (clusters[key].types[report.report_type] || 0) + 1;
    });
    
    // Calculate risk score for each cluster
    const riskAreas = Object.values(clusters)
      .filter(cluster => cluster.count >= 3) // At least 3 reports
      .map(cluster => ({
        ...cluster,
        riskScore: cluster.count * 10 + Object.keys(cluster.types).length * 5
      }))
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10); // Top 10 risk areas
    
    return riskAreas;
  } catch (error) {
    console.error('Error predicting risk areas:', error);
    return [];
  }
}

/**
 * 6. IMAGE CLASSIFICATION (Simplified)
 * Note: For production, use TensorFlow.js or cloud ML service
 * This is a rule-based classifier as a placeholder
 */
function classifyImageFromReport(report) {
  // This would typically use a trained ML model
  // For now, we use text analysis from description and title
  const text = `${report.title} ${report.description}`.toLowerCase();
  
  const classifications = {
    'pothole': ['pothole', 'hole', 'road', 'crack', 'damage'],
    'garbage': ['garbage', 'trash', 'waste', 'litter', 'dump'],
    'street light': ['light', 'lamp', 'dark', 'illumination', 'bulb'],
    'water leak': ['water', 'leak', 'pipe', 'flood', 'drainage']
  };
  
  let maxScore = 0;
  let predictedType = 'Other';
  
  Object.keys(classifications).forEach(type => {
    const keywords = classifications[type];
    const score = keywords.reduce((acc, keyword) => {
      return acc + (text.includes(keyword) ? 1 : 0);
    }, 0);
    
    if (score > maxScore) {
      maxScore = score;
      predictedType = type;
    }
  });
  
  return {
    predictedType,
    confidence: Math.min((maxScore / 3) * 100, 100)
  };
}

module.exports = {
  calculatePriorityScore,
  detectDuplicates,
  analyzeSentiment,
  generateTags,
  predictHighRiskAreas,
  classifyImageFromReport
};

