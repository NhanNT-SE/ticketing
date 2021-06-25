import request from "supertest";
import { app } from "../../app";
import { Types } from "mongoose";
import { natsClient } from "../../nats-client";
import { Ticket } from "../../models/ticket";

it("returns a 404 if the provided id does not exists", async () => {
  const id = new Types.ObjectId().toHexString();
  await request(app)
    .patch(`/api/tickets/${id}`)
    .set("Cookie", global.signin())
    .send({
      title: "Title",
      price: 30,
    })
    .expect(404);
});
it("returns a 401 if the user is not authenticated", async () => {
  const id = new Types.ObjectId().toHexString();
  await request(app)
    .patch(`/api/tickets/${id}`)
    .send({
      title: "Title",
      price: 30,
    })
    .expect(401);
});
it("returns a 401 if the user does not own the ticket", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "Title",
      price: 30,
    });
  await request(app)
    .patch(`/api/tickets/${response.body.id}`)
    .set("Cookie", global.signin())
    .send({
      title: "Title",
      price: 30,
    })
    .expect(401);
});
it("return a 400 if the use provide an valid title or price", async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "Title",
      price: 30,
    });
  await request(app)
    .patch(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "",
      price: 40,
    })
    .expect(400);
  await request(app)
    .patch(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "Title 1",
      price: -10,
    })
    .expect(400);
});
it("update the ticket provided valid inputs", async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "Title 1",
      price: 10,
    });
  await request(app)
    .patch(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "New Title",
      price: 50,
    })
    .expect(200);
  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);

  expect(ticketResponse.body.title).toEqual("New Title");
  expect(ticketResponse.body.price).toEqual(50);
});
it("publishes an event", async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "Title 1",
      price: 10,
    });
  await request(app)
    .patch(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "New Title",
      price: 50,
    })
    .expect(200);
  expect(natsClient.client.publish).toHaveBeenCalled();
});
it("rejects updates if the ticket is reserved", async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "Title 1",
      price: 10,
    });
  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: Types.ObjectId().toHexString() });
  await ticket!.save();
  await request(app)
    .patch(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "New Title",
      price: 50,
    })
    .expect(400);
});
