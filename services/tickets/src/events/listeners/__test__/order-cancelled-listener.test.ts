import { OrderCancelledEvent } from "@nhannt-tickets/common";
import { Types } from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { natsClient } from "../../../nats-client";
import { OrderCancelledListener } from "../order-cancelled-listener";

const setup = async () => {
  const listener = new OrderCancelledListener(natsClient.client);
  const orderId = Types.ObjectId().toHexString();
  const ticket = await Ticket.build({
    title: "concert",
    price: 20,
    userId: "abcdef",
  });
  ticket.set({ orderId });
  await ticket.save();
  const data: OrderCancelledEvent["data"] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };
  //   @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg, orderId, ticket };
};
it("updates the ticket, publishes an event and acks the message", async () => {
  const { listener, data, msg, ticket, orderId } = await setup();
  await listener.onMessage(data, msg);
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).not.toBeDefined();
  expect(msg.ack).toHaveBeenCalled();
  expect(natsClient.client.publish).toHaveBeenCalled();
});
