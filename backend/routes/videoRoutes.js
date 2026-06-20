import express from "express";
import { 
  addVideo, 
  listVideos, 
  getVideoById,
  updateVideo,
  deleteVideo, 
  updateVideoOrder 
} from "../controllers/videoController.js";
import upload from "../middleware/videoupload.js";


const videoRoutes = express.Router();

videoRoutes.post("/add", upload.single("video"), addVideo);
videoRoutes.get("/get", listVideos);
videoRoutes.get("/:id", getVideoById);
videoRoutes.put("/:id", upload.single("video"), updateVideo);
videoRoutes.delete("/:id", deleteVideo);
videoRoutes.put("/:id/order", updateVideoOrder);

export default videoRoutes;