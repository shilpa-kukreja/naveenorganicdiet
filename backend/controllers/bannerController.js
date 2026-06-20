
import fs from "fs";
import path from "path";
import { cleanupFile } from "../middleware/bannerMiddleware.js";
import Banner from "../models/aboutbannerModel.js";

// Add banner
export const addBanner = async (req, res) => {
  try {
    const { title, pageType, description, buttonText, buttonLink, status, order } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "Image file is required" 
      });
    }
    
    if (!title || !pageType) {
      // Clean up uploaded file
      cleanupFile(req.file.filename);
      return res.status(400).json({ 
        success: false, 
        message: "Title and page type are required" 
      });
    }
    
    const image = `/uploads/banners/${req.file.filename}`;
    
    const newBanner = new Banner({
      title,
      image,
      pageType,
      description: description || '',
      buttonText: buttonText || '',
      buttonLink: buttonLink || '',
      status: status === 'true' || status === true,
      order: order || 0
    });
    
    await newBanner.save();
    
    res.status(201).json({ 
      success: true, 
      message: "Banner added successfully", 
      banner: newBanner 
    });
  } catch (error) {
    console.error("Error adding banner:", error);
    
    // Clean up uploaded file on error
    if (req.file) {
      cleanupFile(req.file.filename);
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Error adding banner", 
      error: error.message 
    });
  }
};

// Get all banners (for admin)
export const getAllBanners = async (req, res) => {
  try {
    const { pageType } = req.query;
    const filter = {};
    
    if (pageType) {
      filter.pageType = pageType;
    }
    
    const banners = await Banner.find(filter).sort({ order: 1, createdAt: -1 });
    
    res.status(200).json({ 
      success: true, 
      banners 
    });
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching banners", 
      error: error.message 
    });
  }
};

// Get active banner for specific page (for frontend)
export const getActiveBannerByPage = async (req, res) => {
  try {
    const { pageType } = req.params;
    
    const banner = await Banner.findOne({ 
      pageType, 
      status: true 
    }).sort({ order: 1 });
    
    if (!banner) {
      return res.status(404).json({ 
        success: false, 
        message: "No active banner found for this page" 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      banner 
    });
  } catch (error) {
    console.error("Error fetching banner:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching banner", 
      error: error.message 
    });
  }
};

// Get banner by ID
export const getBannerById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const banner = await Banner.findById(id);
    
    if (!banner) {
      return res.status(404).json({ 
        success: false, 
        message: "Banner not found" 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      banner 
    });
  } catch (error) {
    console.error("Error fetching banner:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching banner", 
      error: error.message 
    });
  }
};

// Update banner
export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, pageType, description, buttonText, buttonLink, status, order } = req.body;
    
    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ 
        success: false, 
        message: "Banner not found" 
      });
    }
    
    const updateData = {
      title: title || banner.title,
      pageType: pageType || banner.pageType,
      description: description !== undefined ? description : banner.description,
      buttonText: buttonText !== undefined ? buttonText : banner.buttonText,
      buttonLink: buttonLink !== undefined ? buttonLink : banner.buttonLink,
      status: status !== undefined ? (status === 'true' || status === true) : banner.status,
      order: order !== undefined ? order : banner.order
    };
    
    // If new image is uploaded
    if (req.file) {
      // Delete old image
      const oldImagePath = path.join("uploads/banners", path.basename(banner.image));
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      
      updateData.image = `/uploads/banners/${req.file.filename}`;
    }
    
    const updatedBanner = await Banner.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    res.status(200).json({ 
      success: true, 
      message: "Banner updated successfully", 
      banner: updatedBanner 
    });
  } catch (error) {
    console.error("Error updating banner:", error);
    
    // Clean up uploaded file on error
    if (req.file) {
      cleanupFile(req.file.filename);
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Error updating banner", 
      error: error.message 
    });
  }
};

// Update banner status
export const updateBannerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const banner = await Banner.findByIdAndUpdate(
      id, 
      { status: status === 'true' || status === true }, 
      { new: true }
    );
    
    if (!banner) {
      return res.status(404).json({ 
        success: false, 
        message: "Banner not found" 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: "Banner status updated successfully", 
      banner 
    });
  } catch (error) {
    console.error("Error updating banner status:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error updating banner status", 
      error: error.message 
    });
  }
};

// Update banner order
export const updateBannerOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { order } = req.body;
    
    const banner = await Banner.findByIdAndUpdate(
      id, 
      { order }, 
      { new: true }
    );
    
    if (!banner) {
      return res.status(404).json({ 
        success: false, 
        message: "Banner not found" 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: "Banner order updated successfully", 
      banner 
    });
  } catch (error) {
    console.error("Error updating banner order:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error updating banner order", 
      error: error.message 
    });
  }
};

// Delete banner
export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    
    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ 
        success: false, 
        message: "Banner not found" 
      });
    }
    
    // Delete the image file
    const imagePath = path.join("uploads/banners", path.basename(banner.image));
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    
    await Banner.findByIdAndDelete(id);
    
    res.status(200).json({ 
      success: true, 
      message: "Banner deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting banner:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error deleting banner", 
      error: error.message 
    });
  }
};

// Bulk update orders
export const bulkUpdateOrders = async (req, res) => {
  try {
    const { banners } = req.body; // Array of { id, order }
    
    if (!Array.isArray(banners)) {
      return res.status(400).json({ 
        success: false, 
        message: "Banners must be an array" 
      });
    }
    
    const updatePromises = banners.map(({ id, order }) => 
      Banner.findByIdAndUpdate(id, { order }, { new: true })
    );
    
    await Promise.all(updatePromises);
    
    res.status(200).json({ 
      success: true, 
      message: "Banner orders updated successfully" 
    });
  } catch (error) {
    console.error("Error updating bulk orders:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error updating banner orders", 
      error: error.message 
    });
  }
};