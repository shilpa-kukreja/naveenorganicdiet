import AboutSection from "../models/aboutModel.js";
import fs from "fs";
import path from "path";

// Get all about sections (for admin)
export const getAllAboutSections = async (req, res) => {
  try {
    const sections = await AboutSection.find().sort({ order: 1 });
    res.status(200).json({ 
      success: true, 
      sections 
    });
  } catch (error) {
    console.error("Error fetching about sections:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching about sections", 
      error: error.message 
    });
  }
};

// Get active about section (for frontend)
export const getActiveAboutSection = async (req, res) => {
  try {
    const section = await AboutSection.findOne({ isActive: true }).sort({ order: 1 });
    
    if (!section) {
      return res.status(404).json({ 
        success: false, 
        message: "No active about section found" 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      section 
    });
  } catch (error) {
    console.error("Error fetching active about section:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching about section", 
      error: error.message 
    });
  }
};

// Create new about section
export const createAboutSection = async (req, res) => {
  try {
    const { title, content, points } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "Image is required" 
      });
    }
    
    if (!title || !content) {
      return res.status(400).json({ 
        success: false, 
        message: "Title and content are required" 
      });
    }
    
    // Parse points if provided
    let parsedPoints = [];
    if (points) {
      try {
        parsedPoints = JSON.parse(points);
        if (!Array.isArray(parsedPoints)) {
          parsedPoints = [];
        }
      } catch (error) {
        parsedPoints = [];
      }
    }
    
    // Set all other sections to inactive if this one is being set as active
    if (req.body.isActive === 'true') {
      await AboutSection.updateMany({}, { isActive: false });
    }
    
    const newSection = new AboutSection({
      title,
      content,
      image: `/uploads/about/${req.file.filename}`,
      points: parsedPoints,
      isActive: req.body.isActive === 'true',
      order: req.body.order || 0
    });
    
    await newSection.save();
    
    res.status(201).json({ 
      success: true, 
      message: "About section created successfully",
      section: newSection 
    });
  } catch (error) {
    console.error("Error creating about section:", error);
    
    // Clean up uploaded file if there was an error
    if (req.file) {
      const filePath = path.join("uploads/about", req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Error creating about section", 
      error: error.message 
    });
  }
};

// Update about section
export const updateAboutSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, points } = req.body;
    
    const section = await AboutSection.findById(id);
    if (!section) {
      return res.status(404).json({ 
        success: false, 
        message: "About section not found" 
      });
    }
    
    // Parse points if provided
    let parsedPoints = section.points;
    if (points) {
      try {
        parsedPoints = JSON.parse(points);
        if (!Array.isArray(parsedPoints)) {
          parsedPoints = section.points;
        }
      } catch (error) {
        // Keep existing points if parsing fails
      }
    }
    
    // If setting this section as active, deactivate others
    if (req.body.isActive === 'true') {
      await AboutSection.updateMany({ _id: { $ne: id } }, { isActive: false });
    }
    
    // Prepare update data
    const updateData = {
      title: title || section.title,
      content: content || section.content,
      points: parsedPoints,
      isActive: req.body.isActive === 'true',
      order: req.body.order || section.order
    };
    
    // If new image is uploaded
    if (req.file) {
      // Delete old image
      const oldImagePath = path.join("uploads/about", path.basename(section.image));
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      
      updateData.image = `/uploads/about/${req.file.filename}`;
    }
    
    const updatedSection = await AboutSection.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    res.status(200).json({ 
      success: true, 
      message: "About section updated successfully",
      section: updatedSection 
    });
  } catch (error) {
    console.error("Error updating about section:", error);
    
    // Clean up uploaded file if there was an error
    if (req.file) {
      const filePath = path.join("uploads/about", req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Error updating about section", 
      error: error.message 
    });
  }
};

// Delete about section
export const deleteAboutSection = async (req, res) => {
  try {
    const { id } = req.params;
    
    const section = await AboutSection.findById(id);
    if (!section) {
      return res.status(404).json({ 
        success: false, 
        message: "About section not found" 
      });
    }
    
    // Delete the image file
    const imagePath = path.join("uploads/about", path.basename(section.image));
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    
    await AboutSection.findByIdAndDelete(id);
    
    res.status(200).json({ 
      success: true, 
      message: "About section deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting about section:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error deleting about section", 
      error: error.message 
    });
  }
};

// Toggle section active status
export const toggleActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const section = await AboutSection.findById(id);
    if (!section) {
      return res.status(404).json({ 
        success: false, 
        message: "About section not found" 
      });
    }
    
    if (section.isActive) {
      // If already active, deactivate it
      section.isActive = false;
    } else {
      // If activating this section, deactivate all others first
      await AboutSection.updateMany({}, { isActive: false });
      section.isActive = true;
    }
    
    await section.save();
    
    res.status(200).json({ 
      success: true, 
      message: section.isActive ? "Section activated" : "Section deactivated",
      section 
    });
  } catch (error) {
    console.error("Error toggling active status:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error toggling active status", 
      error: error.message 
    });
  }
};

// Update section order
export const updateSectionOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { order } = req.body;
    
    const section = await AboutSection.findByIdAndUpdate(
      id, 
      { order }, 
      { new: true }
    );
    
    if (!section) {
      return res.status(404).json({ 
        success: false, 
        message: "About section not found" 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: "Section order updated",
      section 
    });
  } catch (error) {
    console.error("Error updating section order:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error updating section order", 
      error: error.message 
    });
  }
};