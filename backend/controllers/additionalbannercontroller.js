
import AdditionalBannerModel from "../models/additionalbannerModel.js";




export const addadditionalbanner = async(req, res) => {
    try {
       if (!req.file) {
            return res.status(400).json({ error: "Image file is required" });
        }
         const image=`/uploads/additionalbanner/${req.file.filename}`;
        const newadditionalbanner = new AdditionalBannerModel({
            image:image,
        });
        await newadditionalbanner.save();
        res.status(200).json({ message: "additionalbanner added successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getalladditionalbanners = async(req,res)=>{
       try {
            const additionalbanners = await AdditionalBannerModel.find().sort({ createdAt: -1});
            res.status(200).json({ additionalbanners });
       } catch (error) {
         console.log(error);
         res.status(500).json({error: error.message});
         
       }
}


export const deleteadditionalbanner = async(req,res)=>{
    try {
        const { id } = req.params;
        await AdditionalBannerModel.findByIdAndDelete(id);
        res.status(200).json({ message: "additionalbanner deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}


export const updateadditionalbannerstatus = async(req,res)=>{
    try {
        const { id } = req.params;
        const banner = await AdditionalBannerModel.findById(id);
        if (!banner) {
            return res.status(404).json({ message: "Banner not found" });
        }
        banner.image = `/uploads/additionalbanner/${req.file.filename}`;
        banner.status = !banner.status;
        await banner.save();
        res.status(200).json({ message: "Banner status updated successfully", status: banner.status });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}


// Add this to your additionalbannercontroller.js
export const toggleBannerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await AdditionalBannerModel.findById(id);
        if (!banner) {
            return res.status(404).json({ message: "Banner not found" });
        }
        
        // Toggle status
        banner.status = !banner.status;
        await banner.save();
        
        res.status(200).json({ 
            message: "Banner status updated successfully", 
            status: banner.status 
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};



