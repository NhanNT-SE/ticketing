import { Schema, model, Model, Document } from "mongoose";
import { Order, OrderStatus } from "./order";

interface ITicker {
  id: string;
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

const schema = new Schema(
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
  return new Ticket({
    _id: ticket.id,
    title: ticket.title,
    price: ticket.price,
  });
};
schema.methods.isReserved = async function () {
  const existingOrder = await Order.findOne({
    //@ts-ignore
    // ticket: this.id,
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
