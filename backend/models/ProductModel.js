const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    short_description: {
      type: String,
      maxLength: 200,
    },
    long_description: {
      type: String,
    },
    original_price: {
      type: Number,
      default: 200,
    },
    discount_percentage: {
      type: Number,
    },
    final_price: {
      type: Number,
    },
    thumbnail:{
        type : String,
        default : null
    },
    image: [    
      {
        type: String,
      },
    ],
    categoryId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "categories",
        default: [],
      },
    ],
    brandId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Brand",
        default: [],
      },
    ],
    colorId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Color",
        default: [],
      },
    ],
    stock: {
      type: Boolean,
      default: true,
    },
    top_selling: {
      type: Boolean,
      default: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const ProductModel = mongoose.model("product", productSchema);

module.exports = ProductModel;
