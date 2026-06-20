import Product from "../models/productModel.js";
import redis from "../config/redis.js";
import { PRODUCT_ALL, PRODUCT_SINGLE } from "../utils/cacheKeys.js";

// ---------------------------------------
// IMAGE HELPER
// ---------------------------------------
const getImages = (files) => {
  const thumbImg = files?.thumbImg?.[0]
    ? `/uploads/products/${files.thumbImg[0].filename}`
    : null;

  const galleryImg = files?.galleryImg
    ? files.galleryImg.map((f) => `/uploads/products/${f.filename}`)
    : [];

  return { thumbImg, galleryImg };
};

// ---------------------------------------
// CREATE PRODUCT
// ---------------------------------------
export const createProduct = async (req, res) => {
  try {
    const { thumbImg, galleryImg } = getImages(req.files);

    const product = new Product({
      ...req.body,
      thumbImg,
      galleryImg,
    });

    await product.save();

    await redis.del(PRODUCT_ALL);

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ---------------------------------------
// GET ALL PRODUCTS (with Redis Cache)
// ---------------------------------------
export const getProducts = async (req, res) => {
  try {
    const cached = await redis.get(PRODUCT_ALL);

    if (cached) {
      return res.status(200).json({
        source: "redis-cache",
        products: JSON.parse(cached),
      });
    }

    const products = await Product.find().sort({ createdAt: -1 }).lean();

    await redis.setEx(PRODUCT_ALL, 3600, JSON.stringify(products));

    res.status(200).json({
      source: "database",
      products,
    });
  } catch (error) {
    console.error("Get Products Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ---------------------------------------
// GET SINGLE PRODUCT (with Redis Cache)
// ---------------------------------------
export const getProductById = async (req, res) => {
  try {
    const id = req.params.id;
    const key = PRODUCT_SINGLE(id);

    const cached = await redis.get(key);

    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const product = await Product.findById(id).lean();

    await redis.setEx(key, 3600, JSON.stringify(product));

    res.status(200).json(product);
  } catch (error) {
    console.error("Get Product Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ---------------------------------------
// UPDATE PRODUCT
// ---------------------------------------
export const updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await Product.findById(id);

    if (!existing) {
      return res.status(404).json({ message: "Product not found" });
    }

    const { thumbImg, galleryImg } = getImages(req.files);

    const updateData = {
      ...req.body,
      thumbImg: thumbImg || existing.thumbImg,
      galleryImg: galleryImg.length > 0 ? galleryImg : existing.galleryImg,
    };

    const updated = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    await redis.del(PRODUCT_ALL);
    await redis.del(PRODUCT_SINGLE(id));

    res.status(200).json({
      message: "Product updated successfully",
      product: updated,
    });
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ---------------------------------------
// DELETE PRODUCT
// ---------------------------------------
export const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;

    await Product.findByIdAndDelete(id);

    await redis.del(PRODUCT_ALL);
    await redis.del(PRODUCT_SINGLE(id));

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
