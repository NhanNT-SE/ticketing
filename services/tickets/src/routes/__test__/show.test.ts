import request from "supertest";
import { app } from "../../app";
import { Types } from "mongoose";

const createTicket = (title: string, price: number) => {
  return request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({ title, price });
};

it("can fetch a list of tickets", async () => {
  await createTicket("Title 1", 10).expect(200);
  await createTicket("Title 2", 20).expect(200);
  await createTicket("Title 3", 30).expect(200);
  const response = await request(app).get("/api/tickets").send().expect(200);
  expect(response.body.length).toEqual(3);
});

it("returns a 404 if the ticket is not found", async () => {
  const id = new Types.ObjectId().toHexString();
  await request(app).get(`/api/tickets/${id}`).send().expect(404);
});
it("returns the ticket if the ticket is found", async () => {
  const title = "concert";
  const price = 20;
  const response = await createTicket(title, price).expect(200);
  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);
  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});
