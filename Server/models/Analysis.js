const mongoose = require('mongoose');
const AnalysisSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName:     { type: String, required: true },
  fileType:     { type: String, required: true },
  status:       { type: String, enum: ['processing', 'complete', 'failed'], default: 'processing' },
  rawData:      { type: String },
  statistics:   { type: mongoose.Schema.Types.Mixed },
  interpretation: { type: String },
  chartData:    { type: mongoose.Schema.Types.Mixed },
  createdAt:    { type: Date, default: Date.now }
});

module.exports = mongoose.model('Analysis', AnalysisSchema);