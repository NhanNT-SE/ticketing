import { Message } from "node-nats-streaming";
import { Types } from "mongoose";
import { natsClient } from "./../../../nats-client";
import { OrderCreatedListener } from "../order-created-listener";
import { Ticket } from "../../../models/ticket";
import { OrderCreatedEvent, OrderStatus } from "@nhannt-tickets/common";

const setup = async () => {
  const listener = new OrderCreatedListener(natsClient.client);
  const ticket = await Ticket.build({
    title: "concert",
    price: 20,
    userId: "abcdef",
  }).save();
  const data: OrderCreatedEvent["data"] = {
    id: Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: "abcd",
    expiresAt: "abcd",
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };
  //   @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg, ticket };
};
it("sets the userId of the ticket", async () => {
  const { listener, data, msg, ticket } = await setup();
  await listener.onMessage(data, msg);
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).toEqual(data.id);
});

it("acks the message", async () => {
  const { listener, data, msg, ticket } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
it("publishes a ticket updated event", async () => {
  const { listener, data, msg, ticket } = await setup();
  await listener.onMessage(data, msg);
  expect(natsClient.client.publish).toHaveBeenCalled();
  const ticketUpdatedData = JSON.parse(
    (natsClient.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(data.id).toEqual(ticketUpdatedData.orderId);
});
