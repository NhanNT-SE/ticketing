import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import {
  Listener,
  NotFoundError,
  Subjects,
  TicketUpdatedEvent,
} from "@nhannt-tickets/common";
import { Ticket } from "../../models/ticket";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;
  async onMessage(data: TicketUpdatedEvent["data"], msg: Message) {
    const { id, title, price } = data;
    const ticket = await Ticket.findByEvent(data);
    if (!ticket) {
      throw new NotFoundError();
    }
    ticket.set({ title, price });

    await ticket.save();

    msg.ack();
  }
}