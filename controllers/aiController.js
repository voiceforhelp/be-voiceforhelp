const AICache = require('../models/AICache');
const { generateContent, generateVideoContent } = require('../services/geminiService');

// In-memory lock to prevent duplicate concurrent requests for same title
const pendingRequests = new Map();

// @desc    Generate AI content from title
// @route   POST /api/ai/generate-content
// @access  Admin
const generateAIContent = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const trimmedTitle = title.trim();
    const titleHash = AICache.hashTitle(trimmedTitle);

    // Check cache first
    const cached = await AICache.findOne({ titleHash });
    if (cached) {
      return res.json({ success: true, data: cached.response, cached: true });
    }

    // Check if there's already a pending request for this title
    if (pendingRequests.has(titleHash)) {
      try {
        const result = await pendingRequests.get(titleHash);
        return res.json({ success: true, data: result, cached: true });
      } catch (err) {
        // If the pending request failed, continue to make a new one
      }
    }

    // Create a new request and store the promise
    const requestPromise = generateContent(trimmedTitle);
    pendingRequests.set(titleHash, requestPromise);

    try {
      const aiResponse = await requestPromise;

      // Cache the response
      await AICache.findOneAndUpdate(
        { titleHash },
        { titleHash, title: trimmedTitle, response: aiResponse },
        { upsert: true, new: true }
      );

      res.json({ success: true, data: aiResponse, cached: false });
    } finally {
      pendingRequests.delete(titleHash);
    }
  } catch (error) {
    console.error('AI Generation Error:', error.message);

    if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('rate')) {
      return res.status(429).json({
        success: false,
        message: 'AI rate limit reached. Please wait a moment and try again.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to generate AI content. Please try again.',
      error: error.message,
    });
  }
};

// @desc    Generate AI content for video (description + tags)
// @route   POST /api/ai/generate-video-content
// @access  Admin
const generateAIVideoContent = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const trimmedTitle = title.trim();
    const cacheKey = 'video_' + AICache.hashTitle(trimmedTitle);

    // Check cache
    const cached = await AICache.findOne({ titleHash: cacheKey });
    if (cached) {
      return res.json({ success: true, data: cached.response, cached: true });
    }

    const aiResponse = await generateVideoContent(trimmedTitle);

    // Cache
    await AICache.findOneAndUpdate(
      { titleHash: cacheKey },
      { titleHash: cacheKey, title: trimmedTitle, response: aiResponse },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: aiResponse, cached: false });
  } catch (error) {
    console.error('AI Video Generation Error:', error.message);

    if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('rate')) {
      return res.status(429).json({
        success: false,
        message: 'AI rate limit reached. Please wait a moment and try again.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to generate video content.',
      error: error.message,
    });
  }
};

// @desc    Regenerate AI content (bypass cache)
// @route   POST /api/ai/regenerate-content
// @access  Admin
const regenerateAIContent = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const trimmedTitle = title.trim();
    const titleHash = AICache.hashTitle(trimmedTitle);

    // Delete existing cache
    await AICache.deleteOne({ titleHash });

    // Generate fresh
    const aiResponse = await generateContent(trimmedTitle);

    // Cache new response
    await AICache.create({ titleHash, title: trimmedTitle, response: aiResponse });

    res.json({ success: true, data: aiResponse, cached: false });
  } catch (error) {
    console.error('AI Regeneration Error:', error.message);

    if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('rate')) {
      return res.status(429).json({
        success: false,
        message: 'AI rate limit reached. Please wait a moment and try again.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to regenerate content.',
      error: error.message,
    });
  }
};

module.exports = { generateAIContent, generateAIVideoContent, regenerateAIContent };
