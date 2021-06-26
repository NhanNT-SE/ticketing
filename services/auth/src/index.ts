import { connect } from "mongoose";
import { app } from "./app";
const PORT = 3000 || process.env.PORT;
// CONNECT DATABASE
(async function () {
  console.log("starting up...")
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be define");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be define");
  }
  try {
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
  app.listen(PORT, () => console.log(`Auth service listening on port ${PORT}`));
})();
