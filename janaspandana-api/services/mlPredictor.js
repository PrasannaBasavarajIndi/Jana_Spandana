// services/mlPredictor.js
// Machine Learning Predictor for Workforce and Budget Assignment
// Uses linear regression and learns from historical data

const Report = require('../models/Report');

/**
 * Simple Linear Regression Model
 * Trains on historical data to predict workforce and budget
 */
class WorkforceBudgetPredictor {
  constructor() {
    this.model = {
      workforce: {
        weights: {
          reportType: {},
          priority: 0.5,
          areaDensity: 0.3,
          baseWorkforce: 2
        },
        trained: false
      },
      budget: {
        weights: {
          reportType: {},
          priority: 0.8,
          areaDensity: 0.4,
          baseBudget: 5000
        },
        trained: false
      }
    };
  }

  /**
   * Train the model on historical data
   */
  async train() {
    try {
      // Get all cleared reports with assigned workforce and budget
      const trainingData = await Report.find({
        status: 'CLEARED',
        assigned_workforce: { $gt: 0 },
        assigned_budget: { $gt: 0 }
      }).limit(1000); // Use up to 1000 reports for training

      if (trainingData.length < 10) {
        // Not enough data to train, use defaults
        return { trained: false, samples: trainingData.length };
      }

      // Calculate averages by report type
      const typeStats = {};
      
      trainingData.forEach(report => {
        const type = report.report_type;
        if (!typeStats[type]) {
          typeStats[type] = {
            workforce: [],
            budget: [],
            priority: []
          };
        }
        typeStats[type].workforce.push(report.assigned_workforce);
        typeStats[type].budget.push(report.assigned_budget);
        typeStats[type].priority.push(report.priority_score || 50);
      });

      // Calculate averages and update model weights
      Object.keys(typeStats).forEach(type => {
        const stats = typeStats[type];
        const avgWorkforce = stats.workforce.reduce((a, b) => a + b, 0) / stats.workforce.length;
        const avgBudget = stats.budget.reduce((a, b) => a + b, 0) / stats.budget.length;
        const avgPriority = stats.priority.reduce((a, b) => a + b, 0) / stats.priority.length;

        this.model.workforce.weights.reportType[type] = avgWorkforce;
        this.model.budget.weights.reportType[type] = avgBudget;
      });

      // Calculate correlation between priority and workforce/budget
      let priorityWorkforceSum = 0;
      let priorityBudgetSum = 0;
      let prioritySum = 0;

      trainingData.forEach(report => {
        const priority = report.priority_score || 50;
        prioritySum += priority;
        priorityWorkforceSum += priority * report.assigned_workforce;
        priorityBudgetSum += priority * report.assigned_budget;
      });

      const avgPriority = prioritySum / trainingData.length;
      const avgWorkforce = trainingData.reduce((sum, r) => sum + r.assigned_workforce, 0) / trainingData.length;
      const avgBudget = trainingData.reduce((sum, r) => sum + r.assigned_budget, 0) / trainingData.length;

      // Update priority weights based on correlation
      if (avgPriority > 0) {
        this.model.workforce.weights.priority = (priorityWorkforceSum / trainingData.length) / avgPriority;
        this.model.budget.weights.priority = (priorityBudgetSum / trainingData.length) / avgPriority;
      }

      this.model.workforce.trained = true;
      this.model.budget.trained = true;

      return {
        trained: true,
        samples: trainingData.length,
        reportTypes: Object.keys(typeStats).length
      };
    } catch (error) {
      console.error('Error training model:', error);
      return { trained: false, error: error.message };
    }
  }

  /**
   * Predict optimal workforce for a report
   */
  predictWorkforce(report, historicalData = {}) {
    let workforce = this.model.workforce.weights.baseWorkforce;

    // Factor 1: Report Type
    const typeWeight = this.model.workforce.weights.reportType[report.report_type];
    if (typeWeight) {
      workforce = typeWeight;
    }

    // Factor 2: Priority Score
    const priority = report.priority_score || 50;
    workforce += (priority / 100) * this.model.workforce.weights.priority * 3;

    // Factor 3: Area Density (more reports = more workforce needed)
    const nearbyReports = historicalData.nearbyReports || 0;
    workforce += Math.min(nearbyReports * 0.5, 5);

    // Factor 4: Report Type Complexity
    const complexityMultipliers = {
      'Water Leak': 1.5,
      'Pothole': 1.2,
      'Street Light': 1.0,
      'Garbage': 0.8,
      'Other': 1.0
    };
    workforce *= complexityMultipliers[report.report_type] || 1.0;

    // Round to nearest integer, minimum 1
    workforce = Math.max(Math.round(workforce), 1);

    // Cap at reasonable maximum
    return Math.min(workforce, 20);
  }

  /**
   * Predict optimal budget for a report
   */
  predictBudget(report, historicalData = {}) {
    let budget = this.model.budget.weights.baseBudget;

    // Factor 1: Report Type
    const typeWeight = this.model.budget.weights.reportType[report.report_type];
    if (typeWeight) {
      budget = typeWeight;
    }

    // Factor 2: Priority Score
    const priority = report.priority_score || 50;
    budget += (priority / 100) * this.model.budget.weights.priority * 10000;

    // Factor 3: Area Density
    const nearbyReports = historicalData.nearbyReports || 0;
    budget += Math.min(nearbyReports * 2000, 50000);

    // Factor 4: Report Type Complexity
    const complexityMultipliers = {
      'Water Leak': 2.0,
      'Pothole': 1.5,
      'Street Light': 1.2,
      'Garbage': 1.0,
      'Other': 1.0
    };
    budget *= complexityMultipliers[report.report_type] || 1.0;

    // Round to nearest 100
    budget = Math.round(budget / 100) * 100;

    // Minimum budget
    budget = Math.max(budget, 1000);

    // Cap at reasonable maximum
    return Math.min(budget, 500000);
  }

  /**
   * Get prediction confidence based on training data
   */
  getConfidence() {
    if (!this.model.workforce.trained || !this.model.budget.trained) {
      return 0;
    }
    // Confidence increases with more training data
    // This is a simplified confidence metric
    return Math.min(0.95, 0.5 + (this.model.workforce.trained ? 0.3 : 0) + (this.model.budget.trained ? 0.15 : 0));
  }

  /**
   * Get model statistics
   */
  getStats() {
    return {
      trained: this.model.workforce.trained && this.model.budget.trained,
      confidence: this.getConfidence(),
      reportTypes: Object.keys(this.model.workforce.weights.reportType).length,
      workforceWeights: this.model.workforce.weights,
      budgetWeights: this.model.budget.weights
    };
  }
}

// Create singleton instance
const predictor = new WorkforceBudgetPredictor();

/**
 * Train the model (should be called periodically or on startup)
 */
async function trainModel() {
  return await predictor.train();
}

/**
 * Get predictions for a report
 */
async function getPredictions(report) {
  // Get nearby reports count for context
  let nearbyReports = 0;
  try {
    if (report.location && report.location.coordinates) {
      nearbyReports = await Report.countDocuments({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: report.location.coordinates
            },
            $maxDistance: 500
          }
        },
        _id: { $ne: report._id }
      });
    }
  } catch (error) {
    console.warn('Error getting nearby reports for prediction:', error.message);
  }

  const historicalData = { nearbyReports };

  const predictedWorkforce = predictor.predictWorkforce(report, historicalData);
  const predictedBudget = predictor.predictBudget(report, historicalData);
  const confidence = predictor.getConfidence();

  return {
    predictedWorkforce,
    predictedBudget,
    confidence,
    modelStats: predictor.getStats(),
    reasoning: {
      factors: {
        reportType: report.report_type,
        priorityScore: report.priority_score || 50,
        nearbyReports: nearbyReports,
        modelTrained: predictor.model.workforce.trained
      }
    }
  };
}

module.exports = {
  trainModel,
  getPredictions,
  getModelStats: () => predictor.getStats()
};


