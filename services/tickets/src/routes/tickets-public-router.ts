import { NotFoundError } from "@nhannt-tickets/common";
import express, { Request, Response } from "express";
import { Ticket } from "../models/ticket";
const router = express.Router();

router.get("/api/tickets", async (req: Request, res: Response) => {
  const tickets = await Ticket.find({});
  return res.send(tickets);
});
router.get("/api/tickets/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const ticket = await Ticket.findById(id);
  if (!ticket) {
    throw new NotFoundError();
  }
  return res.send(ticket);
});

export { router as ticketsPublicRouter };
