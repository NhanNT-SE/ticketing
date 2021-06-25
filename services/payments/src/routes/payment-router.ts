import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  UnauthorizedError,
  validateRequest,
} from "@nhannt-tickets/common";
import { Router, Request, Response } from "express";
import { body } from "express-validator";
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher";
import { Order } from "../models/order";
import { Payment } from "../models/payment";
import { natsClient } from "../nats-client";
import { stripe } from "../stripe";

const router = Router();
router.post(
  "/api/payments",
  requireAuth,
  [body("token").notEmpty(), body("orderId").notEmpty()],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new UnauthorizedError();
    }
    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError("Can not pay for an cancelled order");
    }
    const charge = await stripe.charges.create({
      currency: "usd",
      amount: order.price * 100,
      source: token,
    });

    const payment = await Payment.build({
      orderId,
      stripeId: charge.id,
    }).save();
    new PaymentCreatedPublisher(natsClient.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    });
    res.send({ id: payment.id });
  }
);
export { router as paymentRouter };
