const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: true,
      required: [true, 'Category name is required'],
      minlength: [3, 'Category name must have at least 3 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

//Using indexes to speed up querying data
categorySchema.index({ slug: 1 });

//Create slug for category
categorySchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//Make a model
const Category = mongoose.model('Category', categorySchema);
//Export model
module.exports = Category;
