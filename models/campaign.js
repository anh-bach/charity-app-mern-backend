const mongoose = require('mongoose');
const slugify = require('slugify');
const { ObjectId } = mongoose.Schema;

const campaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A campaign must have a title'],
      trim: true,
      unique: true,
      minlength: [10, 'A campaign name must have at least 10 characters'],
      maxlength: [40, 'A campagin name must not have more than 40 characters'],
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide campaign description'],
    },
    target: {
      type: Number,
      required: [true, 'Please provide target for your campaign'],
      trim: true,
    },
    createdBy: {
      type: ObjectId,
      ref: 'User',
    },
    images: [String],
    from: Date,
    to: Date,
    location: {},
    active: {
      type: Boolean,
      default: false,
    },
    category: {
      type: ObjectId,
      ref: 'Category',
    },
    subs: [
      {
        type: ObjectId,
        ref: 'Sub',
      },
    ],
  },
  {
    timestamps: true,
  }
);

//Using indexes to query data
campaignSchema.index({ slug: 1 });

//Create slug for campagin
campaignSchema.pre('save', function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign;
