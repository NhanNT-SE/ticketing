import { Message } from "node-nats-streaming";
import {
  OrderCancelledEvent,
  OrderCreatedEvent,
  OrderStatus,
} from "@nhannt-tickets/common";
import { Types } from "mongoose";
import { natsClient } from "../../../nats-client";
import { OrderCreatedListener } from "../order-created-listener";
import { Order } from "../../../models/order";
import { OrderCancelledListener } from "../order-cancelled-listener";

const setup = async () => {
  const listener = new OrderCancelledListener(natsClient.client);
  const order = await Order.build({
    id: Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    price: 10,
    userId: "abc",
    version: 0,
  }).save();
  const data: OrderCancelledEvent["data"] = {
    id: order.id,
    version: 1,
    ticket: {
      id: "abcdfef",
    },
  };
  //   @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg, order };
};

it("updates the status of the order", async () => {
  const { listener, data, msg, order } = await setup();
  await listener.onMessage(data, msg);
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
