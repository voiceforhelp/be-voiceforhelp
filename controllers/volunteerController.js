const Volunteer = require('../models/Volunteer');

// @route   POST /api/volunteers
exports.createVolunteer = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.user) data.userId = req.user._id;

    const volunteer = await Volunteer.create(data);
    res.status(201).json({ success: true, volunteer });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/volunteers (admin)
exports.getVolunteers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const total = await Volunteer.countDocuments(filter);
    const volunteers = await Volunteer.find(filter)
      .populate('userId', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      count: volunteers.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      volunteers,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/volunteers/:id/status (admin)
exports.updateVolunteerStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const volunteer = await Volunteer.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }
    res.json({ success: true, volunteer });
  } catch (error) {
    next(error);
  }
};
