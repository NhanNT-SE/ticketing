import { Types } from "mongoose";
import { requireAuth, validateRequest } from "@nhannt-tickets/common";
import { Request, Response, Router } from "express";
import { body } from "express-validator";
const router = Router();

router.get("/api/orders", async (req: Request, res: Response) => {});
router.get("/api/orders/:id", async (req: Request, res: Response) => {});
router.post(
  "/api/orders",
  requireAuth,
  [
    body("ticketId")
      .notEmpty()
      .custom((input: string) => Types.ObjectId.isValid(input))
      .withMessage("TickerId must be provide"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    res.send({});
  }
);
router.delete("/api/orders/:id", async (req: Request, res: Response) => {});

export { router as ordersRouter };
