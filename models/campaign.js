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
      required: [true, 'A campaign must belong to a user'],
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    from: Date,
    to: Date,
    location: {},
    active: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    category: {
      type: ObjectId,
      ref: 'Category',
      required: [true, 'A campaign must belong to a category'],
    },
    subs: [
      {
        type: ObjectId,
        ref: 'Sub',
        required: [true, 'A campaign must belong to one sub category'],
      },
    ],
  },
  {
    timestamps: true,
  }
);

//Using indexes to speed up querying data
campaignSchema.index({ slug: 1 });

//Create slug for campagin
campaignSchema.pre('save', function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign;
