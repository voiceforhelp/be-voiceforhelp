const { GoogleGenerativeAI } = require('@google/generative-ai');

const getGenAI = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables');
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

const generateContent = async (title) => {
  const model = getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `You are a content writer for "Voice For Help Trust", an Indian NGO that works in food distribution, animal welfare, cow protection, child welfare and medical assistance. Every donation is 100% transparency with daily video proof.

Generate complete content for the following title. The tone should be emotional, engaging, heartwarming and written for an Indian audience. Use simple English that connects with Indian readers emotionally.

Title: "${title}"

Return ONLY a valid JSON object (no markdown, no code blocks, no extra text) with this exact structure:
{
  "blogContent": "Full blog article in HTML format (use <h2>, <h3>, <p>, <strong>, <em>, <ul>, <li>, <blockquote> tags). Minimum 800 words. Make it SEO-friendly, emotionally compelling, with a strong call-to-action at the end. Include subheadings. Write as if telling a real story of impact.",
  "shortDescription": "A compelling 2-3 line summary for blog listing cards. Should make people want to read more.",
  "youtube": {
    "title": "An engaging YouTube video title (max 70 chars). Use emotional hooks.",
    "description": "YouTube video description (200-300 words). Include relevant keywords, emotional storytelling and a call-to-action. Add 'Voice For Help Trust' branding.",
    "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10"]
  },
  "instagram": {
    "caption": "An emotional, engaging Instagram caption (150-200 words). Use line breaks for readability. Include a call-to-action.",
    "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5", "#hashtag6", "#hashtag7", "#hashtag8", "#hashtag9", "#hashtag10", "#hashtag11", "#hashtag12", "#hashtag13", "#hashtag14", "#hashtag15"]
  },
  "facebook": "A compelling Facebook post (150-250 words). Emotional, shareable, with a call-to-action. Written in a conversational tone that encourages engagement and sharing."
}

IMPORTANT RULES:
- Return ONLY the JSON object, nothing else
- All content must relate to the NGO's mission and Indian context
- Use emotional Indian cultural references where appropriate
- Blog content must be in proper HTML with good structure
- YouTube tags should be relevant SEO keywords
- Instagram hashtags should mix popular and niche tags
- Make all content unique and high quality`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  // Parse the JSON - handle cases where model wraps in code blocks
  let cleaned = responseText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  const parsed = JSON.parse(cleaned);

  // Validate required fields
  if (!parsed.blogContent || !parsed.shortDescription || !parsed.youtube || !parsed.instagram || !parsed.facebook) {
    throw new Error('AI response missing required fields');
  }

  return parsed;
};

const generateVideoContent = async (title) => {
  const model = getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `You are a content writer for "Voice For Help Trust", an Indian NGO. Generate YouTube-optimized content for an impact video.

Video Title: "${title}"

Return ONLY a valid JSON object (no markdown, no code blocks):
{
  "description": "YouTube video description (200-300 words). Emotional, engaging, include relevant keywords and call-to-action. Mention Voice For Help Trust. Include timestamp suggestions if relevant.",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10", "tag11", "tag12", "tag13", "tag14", "tag15"]
}

Make it emotional, engaging and optimized for Indian audience. Tags should be SEO-relevant keywords.`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  let cleaned = responseText.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
  cleaned = cleaned.trim();

  return JSON.parse(cleaned);
};

module.exports = { generateContent, generateVideoContent };
