const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: true,
      required: [true, 'Category name is required'],
      minlength: [3, 'Category name must have at least 3 characters'],
      maxLength: [32, 'Category name must be less than 32 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    parent: {
      type: ObjectId,
      ref: 'Category',
      required: [true, 'A sub category must belong to a category'],
    },
  },
  {
    timestamps: true,
  }
);

//Using indexes to speed up querying data
subCategorySchema.index({ slug: 1 });

//Make a model
const SubCategory = mongoose.model('Sub', subCategorySchema);
//Export model
module.exports = SubCategory;
