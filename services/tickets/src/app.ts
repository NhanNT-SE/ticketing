import {
  errorHandle,
  NotFoundError,
  currentUser,
} from "@nhannt-tickets/common";
import cookieSession from "cookie-session";
import express from "express";
import "express-async-errors";
import { ticketsAuthRouter } from "./routes/tickets-auth-router";
import { ticketsPublicRouter } from "./routes/tickets-public-router";
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
app.use(ticketsPublicRouter);
app.use(ticketsAuthRouter);
app.all("*", async (req, res) => {
  throw new NotFoundError();
});
app.use(errorHandle);
export { app };
