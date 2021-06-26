import { natsClient } from "./nats-client";
import { connect } from "mongoose";
import { app } from "./app";
import { OrderCreatedListener } from "./events/listeners/order-created-listener";
import { OrderCancelledListener } from "./events/listeners/order-cancelled-listener";
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

    new OrderCreatedListener(natsClient.client).listen();
    new OrderCancelledListener(natsClient.client).listen();
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
  app.listen(PORT, () => console.log(`Tickets service listening on port ${PORT}`));
})();
