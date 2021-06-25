import { ITicketDoc } from "./ticket";
import { Schema, model, Model, Document } from "mongoose";
import { OrderStatus } from "@nhannt-tickets/common";
export { OrderStatus };
interface IOrder {
  userId: string;
  status: OrderStatus;
  expireAt: Date;
  ticket: ITicketDoc;
}

interface IOrderDoc extends Document {
  userId: string;
  status: OrderStatus;
  expireAt: Date;
  ticket: ITicketDoc;
  version: number;
}
interface ITicketModel extends Model<IOrderDoc> {
  build(user: IOrder): IOrderDoc;
}

const schema = new Schema<IOrder>(
  {
    userId: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    expireAt: { type: Schema.Types.Date },
    ticket: {
      type: Schema.Types.ObjectId,
      ref: "Ticket",
    },
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
schema.statics.build = (ticket: IOrder) => {
  return new Order(ticket);
};
const Order = model<IOrderDoc, ITicketModel>("Order", schema);
export { Order };
