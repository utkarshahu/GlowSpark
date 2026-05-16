const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  brand: String,
  category: {
    type: String,
    enum: ['Skincare', 'Makeup', 'Haircare', 'Fragrance', 'Bath & Body'],
    default: 'Skincare'
  },
  image: {
    url: String,
    filename: String,
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    default: 10,
    min: 0
  },
  ingredients: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  orderCount: {
    type: Number,
    default: 0
  },
  ratingAverage: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
    set: val => Math.round(val * 10) / 10 // Round to 1 decimal
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isNewArrival: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

// Weighted Bestseller Score Virtual
productSchema.virtual('bestsellerScore').get(function() {
    return (this.orderCount * 0.5) + (this.ratingAverage * 0.3) + (this.reviewCount * 0.2);
});

// Exclude soft-deleted products from queries by default
productSchema.pre(/^find/, function(next) {
    this.find({ isDeleted: { $ne: true } });
    next();
});

productSchema.post("findOneAndDelete", async (product) => {
  if (product) {
    await Review.deleteMany({ _id: { $in: product.reviews } });
  }
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
