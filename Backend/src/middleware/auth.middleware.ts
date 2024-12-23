import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import ApiErrorHandler from "../apiErrorHandler";
import User from "../model/user.model";
import { JWTPayload } from "../index";

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const token = req.headers.authorization as string;
    if (!token) {
      return res
        .status(401)
        .json(new ApiErrorHandler(401, "token should be present!"));
    }
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JWTPayload;
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json(new ApiErrorHandler(401, "Unauthorized!"));
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json(new ApiErrorHandler(401, "Unauthorized!"));
  }
};

export default authMiddleware;
