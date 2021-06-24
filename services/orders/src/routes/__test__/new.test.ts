import { Types } from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Order, OrderStatus } from "../../models/order";
import { Ticket } from "../../models/ticket";
import { natsClient } from "../../nats-client";
it("returns an error if the ticket does not exists", async () => {
  const ticketId = Types.ObjectId();
  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({
      ticketId,
    })
    .expect(404);
});
it("returns an error if the ticket is already reserved", async () => {
  const ticket = await Ticket.build({
    title: "concert",
    price: 20,
  }).save();
  await Order.build({
    ticket,
    userId: "userId",
    status: OrderStatus.Created,
    expireAt: new Date(),
  }).save();
  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(400);
});
it("reserver a ticket", async () => {
  const ticket = await Ticket.build({
    title: "concert",
    price: 20,
  }).save();
  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(200);
});
it("emits an order created event", async () => {
  const ticket = await Ticket.build({
    title: "concert",
    price: 20,
  }).save();
  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(200);

  expect(natsClient.client.publish).toHaveBeenCalled();
});
