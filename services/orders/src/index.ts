import { connect } from "mongoose";
import { app } from "./app";
import { ExpirationCompleteListener } from "./events/listeners/expiration-complete-listener";
import { PaymentCreatedListener } from "./events/listeners/payment-created-listener";
import { TicketCreatedListener } from "./events/listeners/ticket-created-listener";
import { TicketUpdatedListener } from "./events/listeners/ticket-updated-listener";
import { natsClient } from "./nats-client";
const PORT = 3000 || process.env.PORT;
// CONNECT DATABASE
(async function () {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be define");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be define");
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error("NATS_CLUSTER_ID must be define");
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("NATS_CLIENT_ID must be define");
  }
  if (!process.env.NATS_URL) {
    throw new Error("NATS_URL must be define");
  }

  try {
    await natsClient.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );
    natsClient.client.on("close", () => {
      console.log("NATS connection closed!");
      process.exit();
    });
    process.on("SIGINT", () => natsClient.client.close());
    process.on("SIGTERM", () => natsClient.client.close());
    new TicketCreatedListener(natsClient.client).listen();
    new TicketUpdatedListener(natsClient.client).listen();
    new ExpirationCompleteListener(natsClient.client).listen();
    new PaymentCreatedListener(natsClient.client).listen();
    await connect(process.env.MONGO_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    console.log("Connected to database");
  } catch (error) {
    console.log(`Error connecting to the database. \n${error}`);
  }
  app.listen(PORT, () => console.log(`Order service listening on port ${PORT}`));
})();
