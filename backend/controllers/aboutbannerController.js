import aboutBannerModel from "../models/aboutbannerModel.js";








export const addaboutBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }
    const image = `/uploads/aboutbanner/${req.file.filename}`;
    const newBanner = new aboutBannerModel({ image });
    await newBanner.save();
    res.status(201).json({ message: "About banner added successfully", banner: newBanner });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};



export const getaboutBanners = async (req, res) => {
  try {
    const banners = await aboutBannerModel.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const updateaboutBannerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const banner = await aboutBannerModel.findByIdAndUpdate(id, { status }, { new: true });

    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    res.status(200).json({ message: "Banner status updated successfully", banner });
    } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
    }    
};



export const deleteaboutBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await aboutBannerModel.findByIdAndDelete(id);
    if (!banner) {
        return res.status(404).json({ message: "Banner not found" });
    }
    res.status(200).json({ message: "Banner deleted successfully" });
    } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
    }
};

