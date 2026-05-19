const Product = require("../models/product");

module.exports.index = async (req, res) => {
  try {
    const { sort, category, page = 1, limit = 12, search, maxPrice } = req.query;
    const pageNum = parseInt(page);
    const limitNum = limit === 'all' ? 10000 : parseInt(limit);
    const skip = (pageNum - 1) * (limitNum || 12);
    
    let matchStage = { isDeleted: { $ne: true } };

    if (category && category !== 'All') {
      matchStage.category = category;
    }

    if (search) {
      matchStage.title = { $regex: search, $options: 'i' };
    }

    if (maxPrice) {
      matchStage.price = { $lte: parseInt(maxPrice) };
    }

    let sortStage = { createdAt: -1 }; // default: newest first

    if (sort === 'new') {
      matchStage.isNewArrival = true;
    } else if (sort === 'bestseller') {
      sortStage = { orderCount: -1, ratingAverage: -1 };
      matchStage.$or = [
        { isBestseller: true },
        {
          ratingAverage: { $gte: 3 },
          orderCount: { $gt: 5 },
          reviewCount: { $gt: 5 }
        }
      ];
    } else if (sort === 'highest-rated') {
      sortStage = { ratingAverage: -1 };
    } else if (sort === 'most-ordered') {
      sortStage = { orderCount: -1 };
    } else if (sort === 'price-asc') {
      sortStage = { price: 1 };
    } else if (sort === 'price-desc') {
      sortStage = { price: -1 };
    }

    const pipeline = [
      { $match: matchStage },
      { $addFields: {
          bestsellerScore: {
            $add: [
              { $multiply: [{ $cond: [{ $eq: ["$isBestseller", true] }, 1000, 0] }, 1] },
              { $multiply: ["$orderCount", 0.5] },
              { $multiply: ["$ratingAverage", 0.3] },
              { $multiply: ["$reviewCount", 0.2] }
            ]
          }
      }},
      { $sort: sort === 'bestseller' ? { bestsellerScore: -1 } : sortStage },
      { $skip: skip },
      { $limit: limitNum }
    ];

    const allProducts = await Product.aggregate(pipeline);
    
    // Get total count for pagination
    const totalCount = await Product.countDocuments(matchStage);

    res.status(200).json({ 
      success: true, 
      products: allProducts,
      pagination: {
        total: totalCount,
        page: pageNum,
        pages: Math.ceil(totalCount / limitNum),
        limit: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.showProduct = async (req, res) => {
  let { id } = req.params;
  const product = await Product.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author", select: "email role username profilePhoto" },
    })
    .populate("owner", "email role username");

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  res.status(200).json({ success: true, product });
};

module.exports.createProduct = async (req, res, next) => {
  try {
    const { product } = req.body;

    let newProduct = new Product(product);
    newProduct.owner = req.user._id;

    if (req.files && req.files.length > 0) {
      newProduct.images = req.files.map(file => ({
        url: file.path,
        filename: file.filename,
      }));
    }

    await newProduct.save();

    res.status(201).json({ success: true, message: "Product created successfully", product: newProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.updateProduct = async (req, res) => {
  try {
    let { id } = req.params;

    let product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Merge basic product properties
    Object.assign(product, req.body.product);

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        url: file.path,
        filename: file.filename,
      }));
      product.images = [...(product.images || []), ...newImages];
    }

    await product.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('productUpdated', product);
    }

    res.status(200).json({ success: true, message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.destroyProduct = async (req, res) => {
  let { id } = req.params;
  let deletedProduct = await Product.findByIdAndDelete(id);

  if (!deletedProduct) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  const io = req.app.get('io');
  if (io) {
    io.emit('productDeleted', id);
  }

  res.status(200).json({ success: true, message: "Product deleted successfully" });
};
