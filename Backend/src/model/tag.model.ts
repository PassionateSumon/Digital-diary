import mongoose, { Schema, model } from "mongoose";

const tagSchema = new Schema(
  {
    name: { type: String, unique: true },
    owner: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);
export default model("Tag", tagSchema);
