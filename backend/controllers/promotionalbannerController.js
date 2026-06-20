import PromotionalBannerModel from "../models/promotionalbannerModel.js";

export const addpromotionalBanner = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Image file is required" });
        }
        const image = `/uploads/promotionalbanner/${req.file.filename}`;
        const newpromotionalbanner = new PromotionalBannerModel({
            image: image,
        });
        await newpromotionalbanner.save();
        res.status(200).json({ message: "Promotional banner added successfully" });
    } catch (error) {
        console.log(error); // Fixed: changed console/log to console.log
        res.status(500).json({ message: error.message });
    }
};

export const getpromotionalbanners = async (req, res) => {
    try {
        const promotionalbanners = await PromotionalBannerModel.find().sort({ createdAt: -1 });
        res.status(200).json({ promotionalbanners });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

export const deletepromotionalbanner = async (req, res) => {
    try {
        const { id } = req.params;
        await PromotionalBannerModel.findByIdAndDelete(id);
        res.status(200).json({ message: "Promotional banner deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

export const updatepromotionalbannerstatus = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await PromotionalBannerModel.findById(id);
        if (!banner) {
            return res.status(404).json({ message: "Banner not found" });
        }
        banner.status = !banner.status;
        await banner.save();
        res.status(200).json({ message: "Banner status updated successfully", status: banner.status });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

export const updatepromotionalbannerimage = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.file) {
            return res.status(400).json({ message: "Image file is required" });
        }
        
        const banner = await PromotionalBannerModel.findById(id);
        if (!banner) {
            return res.status(404).json({ message: "Banner not found" });
        }
        
        banner.image = `/uploads/promotionalbanner/${req.file.filename}`;
        await banner.save();
        res.status(200).json({ message: "Banner image updated successfully", image: banner.image });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};