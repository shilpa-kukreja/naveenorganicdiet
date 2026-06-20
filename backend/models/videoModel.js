import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    video: { type: String, required: true },
    title: { type: String, default: "Untitled Video" },
    description: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const videoModel = mongoose.models.Video || mongoose.model("Video", videoSchema);
export default videoModel;