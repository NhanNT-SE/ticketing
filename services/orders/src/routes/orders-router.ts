import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  UnauthorizedError,
  validateRequest,
} from "@nhannt-tickets/common";
import { Request, Response, Router } from "express";
import { body } from "express-validator";
import { Types } from "mongoose";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";
import { Order } from "../models/order";
import { Ticket } from "../models/ticket";
import { natsClient } from "../nats-client";
const router = Router();
const EXPIRATION_WINDOW_SECONDS = 1 * 60;
router.get("/api/orders", requireAuth, async (req: Request, res: Response) => {
  const orders = await Order.find({ userId: req.currentUser!.id }).populate(
    "ticket"
  );
  res.send(orders);
});
router.get(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate("ticket");
    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new UnauthorizedError();
    }

    res.send(order);
  }
);
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
    const { ticketId } = req.body;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }
    const isReserved = await ticket.isReserved();
    if (isReserved) {
      throw new BadRequestError("Ticket is already reserved");
    }
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);
    const order = await Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expireAt: expiration,
      ticket,
    }).save();

    new OrderCreatedPublisher(natsClient.client).publish({
      id: order.id,
      version:order.version,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expireAt.toISOString(),
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    });
    res.send(order);
  }
);
router.delete(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate("ticket");
    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new UnauthorizedError();
    }
    order.status = OrderStatus.Cancelled;
    await order.save();
    new OrderCancelledPublisher(natsClient.client).publish({
      id: order.id,
      version:order.version,

      ticket: {
        id: order.ticket.id,
      },
    });
    res.status(204).send(order);
  }
);

export { router as ordersRouter };
