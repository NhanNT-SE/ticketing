import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
declare global {
  namespace NodeJS {
    interface Global {
      signin(id?: string): string[];
    }
  }
}
jest.mock("../nats-client");
let mongo: MongoMemoryServer;
process.env.STRIPE_KEY =
  "sk_test_51J6EkrIUiObmJ9aLSEqZb2toueZgGniqGRLURaDfnHxt8iW09HiLQeUDPUDBv4GP8dImugNBMb4lWz4v62ga5ZUJ006tA9yek9";
beforeAll(async () => {
  process.env.JWT_KEY = "test-secret";
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();
  await mongoose.connect(mongoUri, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = (id?: string) => {
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
  };
  const token = jwt.sign(payload, process.env.JWT_KEY!);
  const session = { jwt: token };
  const sessionJSON = JSON.stringify(session);
  const base64 = Buffer.from(sessionJSON).toString("base64");
  return [`express:sess=${base64}`];
};
