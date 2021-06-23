import { BadRequestError, currentUser, validateRequest } from "@nhannt-tickets/common";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { User } from "../models/user";
import { Password } from "../services/password";

const router = express.Router();
router.get("/current-user", currentUser, (req: Request, res: Response) => {
  return res.send({ currentUser: req.currentUser || null });
});
router.post(
  "/sign-in",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password").trim().notEmpty().withMessage("Password can not be empty"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw new BadRequestError("Invalid email or password !");
    }

    const passwordMatch = await Password.compare(user.password, password);
    if (!passwordMatch) {
      throw new BadRequestError("Invalid email or password !");
    }
    const userJwt = await jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_KEY!
    );
    req.session = {
      jwt: userJwt,
    };
    return res.send(user);
  }
);
router.post("/sign-out", (req: Request, res: Response) => {
  req.session = null;
  return res.send("Sign out");
});
router.post(
  "/sign-up",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError("Email in use");
    }
    const user = await User.build({ email, password }).save();

    const userJwt = await jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_KEY!
    );
    req.session = {
      jwt: userJwt,
    };
    return res.send(user);
  }
);

export { router as authRouter };
