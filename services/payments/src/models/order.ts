import { Schema, model, Model, Document } from "mongoose";
import { OrderStatus } from "@nhannt-tickets/common";
export { OrderStatus };
interface IOrder {
  id: string;
  version: number;
  userId: string;
  price: number;
  status: OrderStatus;
}

interface IOrderDoc extends Document {
  version: number;
  userId: string;
  price: number;
  status: OrderStatus;
}
interface ITicketModel extends Model<IOrderDoc> {
  build(user: IOrder): IOrderDoc;
}

const schema = new Schema(
  {
    userId: { type: String, required: true },
    price: { type: Number, require: true },
    status: {
      type: String,
      required: true,
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
schema.statics.build = (order: IOrder) => {
  return new Order({
    _id: order.id,
    version: order.version,
    price: order.price,
    userId: order.userId,
    status: order.status,
  });
};
const Order = model<IOrderDoc, ITicketModel>("Order", schema);
export { Order };
