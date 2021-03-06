import request from "supertest";
import { app } from "../../app";
it("clears the cookie after signing out", async () => {
  await request(app)
    .post("/api/users/sign-up")
    .send({
      email: "nhan@gmail.com",
      password: "123456",
    })
    .expect(200);
  const response = await request(app)
    .post("/api/users/sign-out")
    .send({})
    .expect(200);
  expect(response.get("Set-Cookie")[0]).toEqual(
    "express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly"
  );
});
