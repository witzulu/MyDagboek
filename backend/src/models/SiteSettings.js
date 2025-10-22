const mongoose = require('mongoose');

const SiteSettingsSchema = new mongoose.Schema({
  siteName: {
    type: String,
    required: true,
    trim: true,
    default: 'Dagboek'
  },
  siteLogo: {
    type: String,
    required: false,
    trim: true
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', SiteSettingsSchema);
