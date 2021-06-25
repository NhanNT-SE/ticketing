import { ExpirationCompleteEvent, OrderStatus } from "@nhannt-tickets/common";
import { Types } from "mongoose";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";
import { Ticket } from "../../../models/ticket";
import { natsClient } from "../../../nats-client";
import { ExpirationCompleteListener } from "../expiration-complete-listener";

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsClient.client);

  const ticket = await Ticket.build({
    id: Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  }).save();

  const order = await Order.build({
    status: OrderStatus.Created,
    userId: "abc",
    expireAt: new Date(),
    ticket,
  }).save();

  const data: ExpirationCompleteEvent["data"] = {
    orderId: order.id,
  };
  //   @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, order, data, ticket, msg };
};
it("updates the order status to cancelled", async () => {
  const { listener, order, data, msg } = await setup();
  await listener.onMessage(data, msg);
  const updatedOder = await Order.findById(order.id);
  expect(updatedOder!.status).toEqual(OrderStatus.Cancelled);
});

it("ack the message", async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
it("emit an OrderCancelled event", async () => {
  const { listener, order, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(natsClient.client.publish).toHaveBeenCalled();
  const eventData = JSON.parse(
    (natsClient.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(eventData.id).toEqual(order.id);
});
