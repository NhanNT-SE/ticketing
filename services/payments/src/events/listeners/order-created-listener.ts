import { Message } from "node-nats-streaming";
import { Listener, OrderCreatedEvent, Subjects } from "@nhannt-tickets/common";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const ticket = await Order.build({
      id: data.id,
      price: data.ticket.price,
      userId: data.userId,
      status: data.status,
      version: data.version,
    }).save();

    msg.ack();
  }
}
