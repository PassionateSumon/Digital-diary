import { Response, NextFunction } from "express";
import ApiErrorHandler from "../apiErrorHandler";
import { ExtendedRequest } from "../index";
import Link from "../model/link.model";
import { ISharedLink } from "../index";
import Content from "../model/content.model";

const sharedContentMiddleware = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { sharedLink } = req.params;
    const link = (await Link.findOne({ sharedLink })) as ISharedLink;

    if (!link) {
      return res.status(404).json(new ApiErrorHandler(404, "Link not found!"));
    }

    if (link.accessType === "single") {
      const content = await Content.findById(link.content);
      if (!content) {
        return res
          .status(404)
          .json(new ApiErrorHandler(404, "Content not found!"));
      }
      req.sharedLink = link;
      req.content = content;
      next();
    } else if (link.accessType === "all") {
      req.sharedLink = link;
      next();
    } else {
      return res
        .status(400)
        .json(new ApiErrorHandler(400, "Invalid access type!"));
    }
  } catch (error) {
    return res
      .status(400)
      .json(new ApiErrorHandler(400, "Can't share content!"));
  }
};

export default sharedContentMiddleware;
