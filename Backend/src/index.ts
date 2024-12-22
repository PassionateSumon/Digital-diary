import express, { Request, Response, NextFunction } from "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import mongoose, { Document } from "mongoose";
import { z } from "zod";
import bcrypt from "bcrypt";
import { model, Schema } from "mongoose";
import jwt from "jsonwebtoken";
dotenv.config();

// *** Permissions -->
const app = express();
app.use(
  cors({
    credentials: true,
  })
);
app.use(compression());
app.use(bodyParser.json());
app.use(cookieParser());

const server = http.createServer(app);

// *** Interfaces -->
interface JWTPayload {
  id: string;
}
export interface IUser extends Document {
  email: string;
  password: string;
  token?: string;
}
interface ISharedLink extends Document {
  owner: string;
  accessType: "all" | "single";
  content?: string;
}
export interface ExtendedRequest extends Request {
  user?: IUser;
  sharedLink?: Document;
  content?: Document;
}

// *** Utils --------->
class ApiResponseHandler {
  public code: number;
  public message: string;
  public data?: unknown;
  public role?: string;

  constructor(code: number, message: string, data?: unknown, role?: string) {
    this.code = code;
    this.message = message;
    this.data = data;
    this.role = role;
  }
}
class ApiErrorHandler {
  public code: number;
  public message: string | unknown;

  constructor(code: number, message: string | unknown) {
    this.code = code;
    this.message = message;
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
    };
  }
}
const generateSharingLink = () => {
  const link = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  return link;
};

// *** DB connnection ------>
const connectDB = async () => {
  try {
    const db = await mongoose.connect(process.env.MONGO_URI as string);
    console.log(`Connection: ${db.connection.host}`);
  } catch (error) {
    console.error("Error connecting to db: ", error);
    process.exit(1);
  }
};
connectDB().then(() => {
  server.listen(process.env.PORT || 8080, () => {
    console.log(`port running: http://localhost:${process.env.PORT}`);
  });
});

// *** Models and Schemas -------->
const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: String,
    token: String,
  },
  { timestamps: true }
);
const User = model<IUser>("User", userSchema);
// *** ----------------------------------------
const tagSchema = new Schema(
  {
    name: { type: String, unique: true },
    owner: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);
const Tag = model("Tag", tagSchema);
// *** -------------------------------------
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
const Content = model("Content", contentSchema);
// *** -----------------------------------------
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
const Link = model("Link", linkSchema);

// *** -----------------------------------------
// *** Zod validation ---------->
const Auth = z.object({
  email: z.string().email(),
  password: z.string().min(6, { message: "at least 6 characters" }),
});
const ContentValid = z.object({
  title: z.string(),
  description: z.string().optional(),
  links: z.array(z.string().url()).optional(),
  tags: z.array(z.string()).optional(),
});

// *** Middlewares ------------>
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

// *** Routes ------------->
app.post(
  "/api/v1/signup",
  async (req: Request, res: Response): Promise<any> => {
    const validateBody = Auth.safeParse(req.body);
    if (!validateBody.success) {
      const err = validateBody.error.errors.map(
        (err: { path: any; message: any }) => ({
          path: err.path,
          message: err.message,
        })
      );
      return res.status(400).json(new ApiErrorHandler(400, err));
    }

    try {
      const { email, password } = validateBody.data;
      const foundUser = await User.findOne({ email });
      if (foundUser) {
        return res
          .status(400)
          .json(new ApiErrorHandler(400, "Already exists!"));
      }
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await User.create({
        email,
        password: hashedPassword,
      });

      if (!newUser) {
        return res
          .status(500)
          .json(new ApiErrorHandler(500, "something went wrong!"));
      }
      return res
        .status(200)
        .json(
          new ApiResponseHandler(200, "successfully created user..", newUser)
        );
    } catch (error) {
      return res
        .status(500)
        .json(new ApiErrorHandler(500, "something went wrong at catch!"));
    }
  }
); // signup user

app.post(
  "/api/v1/signin",
  async (req: Request, res: Response): Promise<any> => {
    const validateBody = Auth.safeParse(req.body);
    if (!validateBody.success) {
      const err = validateBody.error.errors.map(
        (err: { path: any; message: any }) => ({
          path: err.path,
          message: err.message,
        })
      );
      return res.status(400).json(new ApiErrorHandler(400, err));
    }
    try {
      const { email, password } = validateBody.data;
      const foundUser = await User.findOne({ email });
      if (!foundUser) {
        return res
          .status(400)
          .json(new ApiErrorHandler(400, "User not found!"));
      }

      const matchedPassword = await bcrypt.compare(
        password,
        foundUser.password as string
      );
      if (!matchedPassword) {
        return res
          .status(400)
          .json(new ApiErrorHandler(400, "Invalid password!"));
      }

      const token: string = jwt.sign(
        { id: foundUser._id },
        process.env.JWT_SECRET as string
      );
      foundUser.token = token;

      return res
        .status(200)
        .json(new ApiResponseHandler(200, "logged in", foundUser));
    } catch (error) {
      return res
        .status(500)
        .json(new ApiErrorHandler(500, "something went wrong at catch!!"));
    }
  }
); // signin user

app.post(
  "/api/v1/create-content",
  authMiddleware,
  async (req: Request, res: Response): Promise<any> => {
    try {
      // console.log("1")
      if (!req.user) {
        return res
          .status(401)
          .json(new ApiErrorHandler(401, "Unauthorized user!"));
      }
      // console.log("2")
      const validateBody = ContentValid.safeParse(req.body);
      if (!validateBody.success) {
        const err = validateBody?.error?.errors?.map(
          (err: { path: any; message: any }) => ({
            path: err.path,
            message: err.message,
          })
        );
        return res.status(400).json(new ApiErrorHandler(400, err));
      }

      const { title, description, links, tags } = validateBody.data;
      // console.log(validateBody.data);

      // now handing to create the dynamic tags if not there present
      let tagIds: mongoose.Types.ObjectId[] = [];
      if (tags && tags.length > 0) {
        tagIds = await Promise.all(
          tags?.map(async (t) => {
            let tag = await Tag.findOne({ name: t });
            if (!tag) {
              tag = await Tag.create({
                name: t,
                owner: (req.user as IUser)._id,
              });
            }
            return tag._id;
          })
        );
      }
      // console.log(tagIds);

      // create the new content
      const newContent = await Content.create({
        title,
        description,
        links,
        tags: tagIds,
        owner: (req.user as IUser)._id,
      });
      console.log(newContent);
      if (!newContent) {
        return res
          .status(500)
          .json(
            new ApiErrorHandler(500, "something went wrong while creating!")
          );
      }

      return res
        .status(200)
        .json(new ApiResponseHandler(200, "content added..", newContent));
    } catch (error) {
      return res
        .status(500)
        .json(new ApiErrorHandler(500, "Internal server error at catch!"));
    }
  }
); // Dynamic tags creating feature is having

app.get(
  "/api/v1/get-all-contents",
  authMiddleware,
  async (req: Request, res: Response): Promise<any> => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json(new ApiErrorHandler(401, "Unauthorized user!"));
      }

      const contents = await Content.find({ owner: req.user._id }).populate(
        "tags"
      );

      return res
        .status(200)
        .json(new ApiResponseHandler(200, "Fetched contents..", contents));
    } catch (error) {
      return res
        .status(500)
        .json(new ApiErrorHandler(500, "Internal server error at catch!"));
    }
  }
); // this is only for actual user

app.get(
  "/api/v1/get-single-content/:id",
  authMiddleware,
  async (req: Request, res: Response): Promise<any> => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json(new ApiErrorHandler(401, "Unauthorized user!"));
      }
      const content = await Content.findById(req.params.id).populate("tags");
      if (!content) {
        return res
          .status(404)
          .json(new ApiErrorHandler(404, "Content not found!"));
      }
      return res
        .status(200)
        .json(new ApiResponseHandler(200, "Fetched content.", content));
    } catch (error) {
      return res
        .status(500)
        .json(new ApiErrorHandler(500, "Internal server error at catch!"));
    }
  }
); // actual user --> single content fetched

app.put(
  "/api/v1/update-content",
  authMiddleware,
  async (req: Request, res: Response): Promise<any> => {}
);

app.delete(
  "/api/v1/delete-content",
  authMiddleware,
  async (req: Request, res: Response): Promise<any> => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json(new ApiErrorHandler(401, "Unauthorized user!"));
      }

      const { contentId, type } = req.body;

      if (type === "single") {
        if (!contentId) {
          return res
            .status(400)
            .json(new ApiErrorHandler(400, "Content-id is required!"));
        }

        const content = await Content.findById(contentId);
        if (!content) {
          return res
            .status(404)
            .json(new ApiErrorHandler(404, "Content not found!"));
        }
        const deletedContent = await Content.deleteOne({
          _id: new mongoose.Types.ObjectId(contentId),
        });
        if (deletedContent.deletedCount === 0) {
          return res
            .status(400)
            .json(new ApiErrorHandler(400, "Can't delete!"));
        }

        return res
          .status(200)
          .json(
            new ApiResponseHandler(200, "Content deleted!", deletedContent)
          );
      } else if (type === "all") {
        const deletedContent = await Content.deleteMany({
          owner: (req.user as IUser)._id,
        });
        if (deletedContent.deletedCount === 0) {
          return res
            .status(400)
            .json(new ApiErrorHandler(400, "Can't delete!"));
        }

        return res
          .status(200)
          .json(
            new ApiResponseHandler(200, "Content deleted!", deletedContent)
          );
      } else {
        return res.status(400).json(new ApiErrorHandler(400, "Bad request!"));
      }
    } catch (error) {
      return res
        .status(500)
        .json(
          new ApiErrorHandler(
            500,
            "Internal server error at catch for deleting!"
          )
        );
    }
  }
);

app.post(
  "/api/v1/brain/share",
  authMiddleware,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { contentId, accessType } = req.body;
      if (!["all", "single"].includes(accessType)) {
        return res.status(400).json(new ApiErrorHandler(400, "Bad request!"));
      }

      if (accessType === "single") {
        if (!contentId) {
          return res
            .status(404)
            .json(new ApiErrorHandler(404, "Content-id is required!"));
        }

        const content = await Content.findOne({
          _id: contentId,
          owner: (req.user as IUser)._id,
        });
        if (!content) {
          return res
            .status(404)
            .json(new ApiErrorHandler(404, "Content not found!!"));
        }

        const sharedLink = generateSharingLink();
        const link = await Link.create({
          owner: (req.user as IUser)._id,
          isActive: true,
          accessType: "single",
          content: contentId,
          sharedLink,
        });
        if (!link) {
          return res
            .status(404)
            .json(
              new ApiErrorHandler(404, "Link is not created for some reason!")
            );
        }

        return res.status(200).json(
          new ApiResponseHandler(200, "Link created successfully..", {
            sharedLink,
          })
        );
      } else if (accessType === "all") {
        const sharedLink = generateSharingLink();
        const link = await Link.create({
          owner: (req.user as IUser)._id,
          isActive: true,
          accessType: "all",
          sharedLink,
        });
        if (!link) {
          return res
            .status(404)
            .json(
              new ApiErrorHandler(404, "Link is not created for some reason!")
            );
        }

        return res.status(200).json(
          new ApiResponseHandler(200, "Link created successfully..", {
            sharedLink,
          })
        );
      }
    } catch (error) {
      return res
        .status(500)
        .json(
          new ApiErrorHandler(
            500,
            "Internal server error at catch while creating link!"
          )
        );
    }
  }
); // link creation for sharing both all and specific content

app.get(
  "/api/v1/brain/get-content/:sharedLink",
  authMiddleware,
  sharedContentMiddleware,
  async (req: ExtendedRequest, res: Response): Promise<any> => {
    try {
      const link = req.sharedLink as ISharedLink;
      if (!link) {
        return res
          .status(404)
          .json(new ApiErrorHandler(404, "Link is not correct!"));
      }

      if (link.accessType === "single") {
        const content = req.content;
        if (!content) {
          return res
            .status(404)
            .json(new ApiErrorHandler(404, "Content not found!"));
        }
        return res
          .status(200)
          .json(
            new ApiResponseHandler(200, "Fetched shared content.", content)
          );
      } else if (link.accessType === "all") {
        const content = await Content.find({ owner: link.owner }).populate(
          "tags"
        );
        if (!content || content.length === 0) {
          return res
            .status(404)
            .json(new ApiErrorHandler(404, "Content not found!"));
        }
        return res
          .status(200)
          .json(new ApiResponseHandler(200, "Fetched.", content));
      }
    } catch (error) {
      return res
        .status(500)
        .json(new ApiErrorHandler(500, "Internal server error at catch!"));
    }
  }
); // shared content
