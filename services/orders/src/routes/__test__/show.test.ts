import { Types } from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";

it("fetches the orders", async () => {
  const ticket = await Ticket.build({
    id: new Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  }).save();
  const user = global.signin();
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(200);

  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(200);
  expect(fetchedOrder.id).toEqual(order.id);
});
it("returns an error if one user tries to fetch another users orders", async () => {
  const ticket = await Ticket.build({
    id: new Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  }).save();
  const user = global.signin();
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(200);

  await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", global.signin())
    .send()
    .expect(401);
});
