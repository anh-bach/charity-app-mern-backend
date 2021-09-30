const mongoose = require('mongoose');

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

//Make a model
const Category = mongoose.model('Category', categorySchema);
//Export model
module.exports = Category;
