import {Schema, model} from "mongoose";
import { IUser } from "../index";

const userSchema = new Schema<IUser>(
    {
      email: { type: String, required: true, unique: true },
      password: String,
      token: String,
    },
    { timestamps: true }
  );
  export default model<IUser>("User", userSchema);