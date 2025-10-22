const SiteSettings = require('../models/SiteSettings');

// @desc    Get site settings
// @route   GET /api/settings
// @access  Private/Admin
exports.getSettings = async (req, res, next) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = new SiteSettings();
      await settings.save();
    }
    res.json(settings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Reset site logo
// @route   DELETE /api/settings/reset-logo
// @access  Private/Admin
exports.resetLogo = async (req, res, next) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = new SiteSettings();
    }

    settings.siteLogo = '';

    await settings.save();
    res.json(settings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Upload site logo
// @route   POST /api/settings/upload-logo
// @access  Private/Admin
exports.uploadLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'Please upload a file' });
    }

    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = new SiteSettings();
    }

    settings.siteLogo = `/uploads/${req.file.filename}`;

    await settings.save();
    res.json(settings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update site settings
// @route   PUT /api/settings
// @access  Private/Admin
exports.updateSettings = async (req, res, next) => {
  const { siteName, siteLogo, maintenanceMode } = req.body;

  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = new SiteSettings();
    }

    settings.siteName = siteName || settings.siteName;
    settings.siteLogo = siteLogo || settings.siteLogo;
    settings.maintenanceMode = maintenanceMode === undefined ? settings.maintenanceMode : maintenanceMode;

    await settings.save();
    res.json(settings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
