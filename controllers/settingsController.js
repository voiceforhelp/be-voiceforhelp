const Setting = require('../models/Setting');

// Get public settings (filtered)
exports.getPublicSettings = async (req, res) => {
  try {
    const settings = await Setting.find({
      key: { $in: ['heroBannerImage', 'heroTitle', 'heroSubtitle', 'missionImage', 'missionText'] }
    });
    const result = {};
    settings.forEach(s => { result[s.key] = s.value; });
    res.json({ success: true, settings: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all settings (admin)
exports.getAllSettings = async (req, res) => {
  try {
    const settings = await Setting.find().sort('key');
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update or create a setting
exports.upsertSetting = async (req, res) => {
  try {
    const { key, value, description } = req.body;
    if (!key || value === undefined) {
      return res.status(400).json({ success: false, message: 'Key and value are required' });
    }
    const setting = await Setting.findOneAndUpdate(
      { key },
      { value, description: description || '' },
      { upsert: true, new: true, runValidators: true }
    );
    res.json({ success: true, setting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk update settings
exports.bulkUpdateSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    if (!settings || !Array.isArray(settings)) {
      return res.status(400).json({ success: false, message: 'Settings array is required' });
    }
    const operations = settings.map(s => ({
      updateOne: {
        filter: { key: s.key },
        update: { value: s.value, description: s.description || '' },
        upsert: true,
      }
    }));
    await Setting.bulkWrite(operations);
    const updated = await Setting.find().sort('key');
    res.json({ success: true, settings: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a setting
exports.deleteSetting = async (req, res) => {
  try {
    await Setting.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Setting deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
