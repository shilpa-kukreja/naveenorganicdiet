import CoreValue from "../models/aboutCoreValueModel.js";


// Get all core values (for admin)
export const getAllCoreValues = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    const coreValues = await CoreValue.find(filter).sort({ order: 1, createdAt: -1 });
    res.status(200).json({ 
      success: true, 
      coreValues 
    });
  } catch (error) {
    console.error("Error fetching core values:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching core values", 
      error: error.message 
    });
  }
};

// Get active core values (for frontend)
export const getActiveCoreValues = async (req, res) => {
  try {
    const coreValues = await CoreValue.find({ isActive: true }).sort({ order: 1 });
    
    res.status(200).json({ 
      success: true, 
      coreValues 
    });
  } catch (error) {
    console.error("Error fetching active core values:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching core values", 
      error: error.message 
    });
  }
};

// Get single core value
export const getCoreValueById = async (req, res) => {
  try {
    const { id } = req.params;
    const coreValue = await CoreValue.findById(id);
    
    if (!coreValue) {
      return res.status(404).json({ 
        success: false, 
        message: "Core value not found" 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      coreValue 
    });
  } catch (error) {
    console.error("Error fetching core value:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching core value", 
      error: error.message 
    });
  }
};

// Create new core value
export const createCoreValue = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      icon, 
      bgColor, 
      borderColor, 
      iconBg, 
      category, 
      order 
    } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ 
        success: false, 
        message: "Title and description are required" 
      });
    }
    
    const newCoreValue = new CoreValue({
      title,
      description,
      icon: icon || "🎯",
      bgColor: bgColor || "bg-amber-50",
      borderColor: borderColor || "border-amber-500",
      iconBg: iconBg || "bg-amber-100",
      category: category || 'mission',
      order: order || 0,
      isActive: req.body.isActive === 'true' || req.body.isActive === true
    });
    
    await newCoreValue.save();
    
    res.status(201).json({ 
      success: true, 
      message: "Core value created successfully",
      coreValue: newCoreValue 
    });
  } catch (error) {
    console.error("Error creating core value:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error creating core value", 
      error: error.message 
    });
  }
};

// Update core value
export const updateCoreValue = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      icon, 
      bgColor, 
      borderColor, 
      iconBg, 
      category, 
      order, 
      isActive 
    } = req.body;
    
    const coreValue = await CoreValue.findById(id);
    if (!coreValue) {
      return res.status(404).json({ 
        success: false, 
        message: "Core value not found" 
      });
    }
    
    const updateData = {
      title: title || coreValue.title,
      description: description || coreValue.description,
      icon: icon || coreValue.icon,
      bgColor: bgColor || coreValue.bgColor,
      borderColor: borderColor || coreValue.borderColor,
      iconBg: iconBg || coreValue.iconBg,
      category: category || coreValue.category,
      order: order !== undefined ? order : coreValue.order,
      isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : coreValue.isActive
    };
    
    const updatedCoreValue = await CoreValue.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    res.status(200).json({ 
      success: true, 
      message: "Core value updated successfully",
      coreValue: updatedCoreValue 
    });
  } catch (error) {
    console.error("Error updating core value:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error updating core value", 
      error: error.message 
    });
  }
};

// Delete core value
export const deleteCoreValue = async (req, res) => {
  try {
    const { id } = req.params;
    
    const coreValue = await CoreValue.findById(id);
    if (!coreValue) {
      return res.status(404).json({ 
        success: false, 
        message: "Core value not found" 
      });
    }
    
    await CoreValue.findByIdAndDelete(id);
    
    res.status(200).json({ 
      success: true, 
      message: "Core value deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting core value:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error deleting core value", 
      error: error.message 
    });
  }
};

// Toggle active status
export const toggleActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const coreValue = await CoreValue.findById(id);
    if (!coreValue) {
      return res.status(404).json({ 
        success: false, 
        message: "Core value not found" 
      });
    }
    
    coreValue.isActive = !coreValue.isActive;
    await coreValue.save();
    
    res.status(200).json({ 
      success: true, 
      message: coreValue.isActive ? "Core value activated" : "Core value deactivated",
      coreValue 
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

// Update order
export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { order } = req.body;
    
    const coreValue = await CoreValue.findByIdAndUpdate(
      id, 
      { order }, 
      { new: true }
    );
    
    if (!coreValue) {
      return res.status(404).json({ 
        success: false, 
        message: "Core value not found" 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: "Order updated successfully",
      coreValue 
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error updating order", 
      error: error.message 
    });
  }
};

// Bulk update orders
export const bulkUpdateOrders = async (req, res) => {
  try {
    const { values } = req.body; // Array of { id, order }
    
    if (!Array.isArray(values)) {
      return res.status(400).json({ 
        success: false, 
        message: "Values must be an array" 
      });
    }
    
    const updatePromises = values.map(({ id, order }) => 
      CoreValue.findByIdAndUpdate(id, { order }, { new: true })
    );
    
    await Promise.all(updatePromises);
    
    res.status(200).json({ 
      success: true, 
      message: "Orders updated successfully" 
    });
  } catch (error) {
    console.error("Error updating bulk orders:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error updating orders", 
      error: error.message 
    });
  }
};