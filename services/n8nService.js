const axios = require('axios');

const triggerN8nWorkflow = async (videoData) => {
  try {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn('N8N_WEBHOOK_URL not configured, skipping automation');
      return null;
    }

    const payload = {
      videoId: videoData._id,
      videoUrl: videoData.videoUrl,
      thumbnailUrl: videoData.thumbnailUrl || '',
      title: videoData.title,
      description: videoData.description || '',
      category: videoData.category?.name || videoData.category || '',
      donorGroupDate: videoData.donorGroupDate,
      tags: videoData.tags || [],
      linkedDonorCount: videoData.linkedDonors ? videoData.linkedDonors.length : 0,
      existingSocialLinks: videoData.socialLinks || {},
      timestamp: new Date().toISOString(),
    };

    const response = await axios.post(webhookUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    });

    console.log('N8N workflow triggered successfully');
    return response.data;
  } catch (error) {
    console.error('N8N workflow trigger failed:', error.message);
    return null;
  }
};

module.exports = { triggerN8nWorkflow };
