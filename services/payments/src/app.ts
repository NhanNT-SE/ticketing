import {
  errorHandle,
  NotFoundError,
  currentUser,
} from "@nhannt-tickets/common";
import cookieSession from "cookie-session";
import express from "express";
import "express-async-errors";
import { paymentRouter } from "./routes/payment-router";

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
app.use(currentUser);
app.use(paymentRouter);
app.all("*", async (req, res) => {
  throw new NotFoundError();
});
app.use(errorHandle);
export { app };
