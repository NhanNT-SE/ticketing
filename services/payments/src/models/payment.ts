import { Schema, model, Model, Document } from "mongoose";
import { OrderStatus } from "@nhannt-tickets/common";
export { OrderStatus };
interface IPayment {
  orderId: string;
  stripeId: string;
}

interface IPaymentDoc extends Document {
  orderId: string;
  stripeId: string;
}
interface IPaymentModel extends Model<IPaymentDoc> {
  build(user: IPayment): IPaymentDoc;
}

const schema = new Schema(
  {
    orderId: { type: String, required: true },
    stripeId: { type: String, require: true },
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
schema.statics.build = (payment: IPayment) => {
  return new Payment(payment);
};
const Payment = model<IPaymentDoc, IPaymentModel>("Payment", schema);
export { Payment };
