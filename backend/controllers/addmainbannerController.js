
import AddMainBanner from '../models/addmainbannerModel.js';
import fs from 'fs';
import path from 'path';

export const addmainbanner = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Image is required" });
        }
        
        const image = `/uploads/addmainbanner/${req.file.filename}`;
        
        const newBanner = new AddMainBanner({
            image: image,
        });
        
        await newBanner.save();
        
        res.status(201).json({ 
            success: true, 
            message: "Main Banner added successfully", 
            banner: newBanner 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
}

export const getAllMainBanners = async (req, res) => {
    try {
        const banners = await AddMainBanner.find().sort({ createdAt: -1 });
        res.status(200).json({ 
            success: true, 
            banners 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
}

export const deleteMainBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await AddMainBanner.findById(id);
        
        if (!banner) {
            return res.status(404).json({ 
                success: false, 
                message: "Banner not found" 
            });
        }
        
        // Delete image file from server
        if (banner.image) {
            const imagePath = path.join('public', banner.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        
        await AddMainBanner.findByIdAndDelete(id);
        
        res.status(200).json({ 
            success: true, 
            message: "Banner deleted successfully" 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
}

export const updateMainBannerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await AddMainBanner.findById(id);
        
        if (!banner) {
            return res.status(404).json({ 
                success: false, 
                message: "Banner not found" 
            });
        }
        
        // Check if this is a status update or image update
        if (req.file) {
            // Delete old image if exists
            if (banner.image) {
                const oldImagePath = path.join('public', banner.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            
            // Update with new image
            banner.image = `/uploads/addmainbanner/${req.file.filename}`;
        } else {
            // Toggle status if no image uploaded
            banner.status = !banner.status;
        }
        
        await banner.save();
        
        res.status(200).json({ 
            success: true, 
            message: req.file ? "Banner image updated successfully" : "Banner status updated successfully", 
            banner 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
}