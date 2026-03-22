const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    content: { type: String, default: '' },
    shortDescription: { type: String, default: '' },
    image: { type: String, default: '' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    socialContent: {
      youtube: {
        title: { type: String, default: '' },
        description: { type: String, default: '' },
        tags: [{ type: String }],
      },
      instagram: {
        caption: { type: String, default: '' },
        hashtags: [{ type: String }],
      },
      facebook: { type: String, default: '' },
    },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

blogSchema.index({ slug: 1 });
blogSchema.index({ status: 1, createdAt: -1 });
blogSchema.index({ views: -1 });
blogSchema.index({ title: 'text', shortDescription: 'text' });

// Generate slug from title
blogSchema.pre('validate', function (next) {
  if (this.title && (!this.slug || this.isModified('title'))) {
    this.slug =
      this.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim() +
      '-' +
      Date.now().toString(36);
  }
  next();
});

module.exports = mongoose.model('Blog', blogSchema);
