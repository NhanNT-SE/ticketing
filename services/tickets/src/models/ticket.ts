import { Schema, model, Model, Document } from "mongoose";
interface ITicker {
  title: string;
  price: number;
  userId: string;
}

interface ITicketDoc extends Document {
  title: string;
  price: number;
  userId: string;
  version: number;
  orderId?: string;
}
interface ITicketModel extends Model<ITicketDoc> {
  build(user: ITicker): ITicketDoc;
}

const schema = new Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    userId: { type: String, required: true },
    orderId: { type: String },
  },
  {
    optimisticConcurrency: true,
    versionKey: "version",
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);
schema.statics.build = (ticket: ITicker) => {
  return new Ticket(ticket);
};
const Ticket = model<ITicketDoc, ITicketModel>("Ticket", schema);
export { Ticket };
