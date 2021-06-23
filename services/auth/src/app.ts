import { errorHandle, NotFoundError } from "@nhannt-tickets/common";
import cookieSession from "cookie-session";
import express from "express";
import "express-async-errors";
import { authRouter } from "./routes/auth-router";
const app = express();
app.set("trust proxy", true);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);

app.use("/api/users", authRouter);
app.all("*", async (req, res) => {
  throw new NotFoundError();
});
app.use(errorHandle);
export { app };
