import mongoose, { Schema, model } from "mongoose";

const linkSchema = new Schema(
  {
    owner: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    isActive: { type: Boolean, default: false },
    accessType: { type: String, enum: ["single", "all"], default: "all" },
    content: { type: mongoose.Types.ObjectId, ref: "Content" },
    sharedLink: { type: String, unique: true, required: true },
  },
  { timestamps: true }
);
export default model("Link", linkSchema);
