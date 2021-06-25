import {
  BadRequestError,
  NotFoundError,
  requireAuth,
  UnauthorizedError,
  validateRequest,
} from "@nhannt-tickets/common";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import { Ticket } from "../models/ticket";
import { natsClient } from "../nats-client";
import { TicketCreatedPublisher } from "../events/publishers/ticket-created-publisher";
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher";
const router = express.Router();

router.post(
  "/api/tickets",
  requireAuth,
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be greater than 0"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;
    const ticket = await Ticket.build({
      title,
      price,
      userId: req.currentUser!.id,
    }).save();
    new TicketCreatedPublisher(natsClient.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    });
    return res.send(ticket);
  }
);

router.patch(
  "/api/tickets/:id",
  requireAuth,
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be greater than 0"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      throw new NotFoundError();
    }
    if(ticket.orderId){
      throw new BadRequestError("Can not edit a reserved ticket")
    }
    if (ticket.userId !== req.currentUser!.id) {
      throw new UnauthorizedError();
    }
    await ticket
      .set({
        title: req.body.title,
        price: req.body.price,
      })
      .save();
    new TicketUpdatedPublisher(natsClient.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    });
    return res.send(ticket);
  }
);

export { router as ticketsAuthRouter };
