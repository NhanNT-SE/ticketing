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
  version: number;
  isReserved(): Promise<boolean>;
}
interface ITicketModel extends Model<ITicketDoc> {
  build(user: ITicker): ITicketDoc;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<ITicketDoc | null>;
}

const schema = new Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
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

schema.statics.findByEvent = (event: { id: string; version: number }) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};

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
