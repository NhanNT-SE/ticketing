import request from "supertest";
import { app } from "../../app";
it("fails when a email does not exists supplied", async () => {
  return request(app)
    .post("/api/users/sign-in")
    .send({
      email: "nhan@gmail.com",
      password: "12345678",
    })
    .expect(200);
});

it("fails when an incorrect password is supplied", async () => {
  await request(app)
    .post("/api/users/sign-up")
    .send({
      email: "nhan@gmail.com",
      password: "123456",
    })
    .expect(200);
  await request(app)
    .post("/api/users/sign-in")
    .send({
      email: "nhan@gmail.com",
      password: "654321",
    })
    .expect(400);
});
it("responds with a cookie when give valid credentials", async () => {
  await request(app)
    .post("/api/users/sign-up")
    .send({
      email: "nhan@gmail.com",
      password: "123456",
    })
    .expect(200);
  const response = await request(app)
    .post("/api/users/sign-in")
    .send({
      email: "nhan@gmail.com",
      password: "123456",
    })
    .expect(200);
  expect(response.get("Set-Cookie")).toBeDefined();
});
