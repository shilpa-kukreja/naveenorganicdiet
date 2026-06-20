import videoModel from "../models/videoModel.js";

// Add Video
export const addVideo = async (req, res) => {
  try {
    const { order, title, description } = req.body;
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No video uploaded" });
    }
   
    const newVideo = new videoModel({
      video: `/uploads/videos/${req.file.filename}`,
      title: title || "Untitled Video",
      description: description || "",
      order: order || 0,
    });

    await newVideo.save();
    res.status(201).json({ success: true, video: newVideo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// List Videos
export const listVideos = async (req, res) => {
  try {
    const videos = await videoModel.find().sort({ order: 1 });
    res.status(200).json({ success: true, videos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Video
export const getVideoById = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await videoModel.findById(id);
    
    if (!video) {
      return res.status(404).json({ success: false, message: "Video not found" });
    }
    
    res.status(200).json({ success: true, video });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Video Details
export const updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, order } = req.body;
    
    let updateData = { title, description, order };
    
    // If a new video file is uploaded
    if (req.file) {
      updateData.video = `/uploads/videos/${req.file.filename}`;
    }
    
    const video = await videoModel.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!video) {
      return res.status(404).json({ success: false, message: "Video not found" });
    }
    
    res.status(200).json({ success: true, video });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete video
export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await videoModel.findByIdAndDelete(id);
    
    if (!video) {
      return res.status(404).json({ success: false, message: "Video not found" });
    }
    
    res.status(200).json({ success: true, message: "Video deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting video", error: error.message });
  }
};

// Update video order
export const updateVideoOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { order } = req.body;

    const video = await videoModel.findByIdAndUpdate(
      id, 
      { order }, 
      { new: true }
    );
    
    if (!video) {
      return res.status(404).json({ success: false, message: "Video not found" });
    }
    
    res.status(200).json({ success: true, video });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating video order", error: error.message });
  }
};