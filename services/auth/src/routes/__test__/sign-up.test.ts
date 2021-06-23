import request from "supertest";
import { app } from "../../app";
it("return a 200 on successful on sin up", async () => {
  return request(app)
    .post("/api/users/sign-up")
    .send({
      email: "nhan@gmail.com",
      password: "12345678",
    })
    .expect(200);
});

it("return a 400 with an invalid email", async () => {
  return request(app)
    .post("/api/users/sign-up")
    .send({
      email: "nhan123456",
      password: "12345678",
    })
    .expect(400);
});
it("return a 400 with an invalid password", async () => {
  return request(app)
    .post("/api/users/sign-up")
    .send({
      email: "nhan123456",
      password: "1",
    })
    .expect(400);
});
it("return a 400 with missing email or password", async () => {
  await request(app)
    .post("/api/users/sign-up")
    .send({
      email: "nhan@gmail.com",
    })
    .expect(400);
  await request(app)
    .post("/api/users/sign-up")
    .send({
      password: "12345678",
    })
    .expect(400);
});
it("disallows duplicate emails", async () => {
  await request(app)
    .post("/api/users/sign-up")
    .send({
      email: "nhan@gmail.com",
      password: "123456",
    })
    .expect(200);
  await request(app)
    .post("/api/users/sign-up")
    .send({
      email: "nhan@gmail.com",
      password: "123456",
    })
    .expect(400);
});
it("sets a cookie after successful sign up", async () => {
  const response = await request(app)
    .post("/api/users/sign-up")
    .send({
      email: "nhan@gmail.com",
      password: "123456",
    })
    .expect(200);
  expect(response.get("Set-Cookie")).toBeDefined();
});
