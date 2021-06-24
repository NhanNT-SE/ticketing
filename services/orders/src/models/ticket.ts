import { Schema, model, Model, Document } from "mongoose";
import { Order, OrderStatus } from "./order";

interface ITicker {
  title: string;
  price: number;
}

export interface ITicketDoc extends Document {
  title: string;
  price: number;
  isReserved(): Promise<boolean>;
}
interface ITicketModel extends Model<ITicketDoc> {
  build(user: ITicker): ITicketDoc;
}

const schema = new Schema<ITicker>(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
  },
  {
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
schema.methods.isReserved = async function () {
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });

  return !!existingOrder;
};
const Ticket = model<ITicketDoc, ITicketModel>("Ticket", schema);
export { Ticket };
