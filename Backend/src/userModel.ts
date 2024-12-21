import { model, Schema } from "mongoose";

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: String,
});

export default model("User", userSchema);
