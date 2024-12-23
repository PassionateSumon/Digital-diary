import mongoose, { Schema, model } from "mongoose";

const contentSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: false },
    links: { type: [String], default: [] },
    tags: [{ type: mongoose.Types.ObjectId, ref: "Tag" }],
    owner: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);
export default model("Content", contentSchema);
